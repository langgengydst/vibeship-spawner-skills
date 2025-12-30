# Motor Control

> Patterns for electric motor control including Field Oriented Control (FOC),
stepper motor control, encoder interfaces, current sensing, and power
electronics. Covers BLDC, PMSM, DC brushed, and stepper motor applications.


**Category:** hardware | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Both high and low side MOSFETs on = short circuit through driver

**Why it happens:**
In a half-bridge, if both high-side and low-side transistors
conduct simultaneously, you get a direct short from power to ground.

This happens when:
- Missing dead time between switching
- PWM glitches during transitions
- Software bug setting both outputs high

Result: Large current spike, destroyed MOSFETs in microseconds.


**Solution:**
```
// Hardware dead time (preferred)
// STM32 advanced timer dead time
TIM1->BDTR = TIM_BDTR_MOE | (50 << 0);  // 50 * Tdts dead time

// Or in HAL
TIM_BDTRInitTypeDef bdtr = {
    .DeadTime = 100,  // Dead time value
    .AutomaticOutput = TIM_AUTOMATICOUTPUT_ENABLE
};
HAL_TIMEx_ConfigBreakDeadTime(&htim1, &bdtr);

// Software dead time (if no hardware support)
void set_pwm_safe(int phase, float duty) {
    // Turn off first
    set_high_side(phase, 0);
    set_low_side(phase, 0);
    delay_ns(200);  // Dead time
    // Then turn on desired side
    if (duty > 0)
        set_high_side(phase, duty);
    else
        set_low_side(phase, -duty);
}

```

**Symptoms:**
- Driver MOSFETs burn immediately
- Large current spike on scope
- Magic smoke

---

### [CRITICAL] Sampling current during switching gives wrong values

**Why it happens:**
During PWM switching, current is changing rapidly (di/dt from inductance).
Also, switching noise couples into measurements.

You must sample at a specific point in PWM cycle:
- Center of ON-time for low-side sensing
- Center of OFF-time for DC-link sensing

Random sampling gives unusable current values.


**Solution:**
```
// CORRECT: Trigger ADC from PWM timer

// STM32: Trigger ADC from timer TRGO
htim1.Init.TRGOSource = TIM_TRGO_UPDATE;  // Trigger at counter update

// ADC: External trigger from timer
hadc.Init.ExternalTrigConv = ADC_EXTERNALTRIG_T1_TRGO;
hadc.Init.ExternalTrigConvEdge = ADC_EXTERNALTRIGCONVEDGE_RISING;

// Or trigger from CCR4 for precise timing
TIM1->CCR4 = TIM1->ARR / 2;  // Trigger at PWM center
TIM1->CCMR2 |= TIM_CCMR2_OC4M_1;  // PWM mode for trigger

// Use DMA for ADC to minimize jitter
HAL_ADC_Start_DMA(&hadc, adc_buffer, 3);

// In timer update ISR (or DMA complete)
void TIM1_UP_IRQHandler(void) {
    // ADC values are ready, synchronized to PWM
    ia = adc_buffer[0];
    ib = adc_buffer[1];
    foc_update(ia, ib);
}

```

**Symptoms:**
- Current readings are noisy
- Control loop oscillates
- Readings vary with duty cycle

---

### [HIGH] Electrical noise causes false counts, wrong velocity

**Why it happens:**
Encoder signals are vulnerable to noise from:
- Motor PWM switching
- Long cable runs
- Ground loops
- EMI from power stage

A single noise pulse can add or remove a count.
At high speeds, can cause motor control instability.


**Solution:**
```
// 1. Hardware: Use differential encoder signals (RS-422)
// Add 100 ohm termination resistors

// 2. Hardware: Add filtering capacitors on encoder inputs
// 1nF-10nF between A/B/Z and ground

// 3. Use hardware digital filter (STM32 timers have this)
TIM2->CCMR1 |= (0x0F << 4);  // Input filter, max filtering

// 4. Software velocity filtering
float encoder_velocity_filtered(void) {
    static float velocity_buffer[8];
    static int idx = 0;

    int32_t count = TIM2->CNT;
    static int32_t prev_count = 0;

    // Handle wraparound
    int32_t delta = count - prev_count;
    if (delta > (CPR/2)) delta -= CPR;
    if (delta < -(CPR/2)) delta += CPR;
    prev_count = count;

    // Moving average filter
    velocity_buffer[idx++] = delta / dt;
    idx &= 7;

    float sum = 0;
    for (int i = 0; i < 8; i++) sum += velocity_buffer[i];
    return sum / 8;
}

// 5. Sanity check velocity
if (fabs(velocity) > MAX_PHYSICALLY_POSSIBLE) {
    velocity = prev_velocity;  // Reject outlier
}

```

**Symptoms:**
- Position jumps randomly
- Velocity spikes to impossible values
- More issues when PWM is active

---

### [HIGH] Wrong angle alignment between encoder and motor phases

**Why it happens:**
FOC requires knowing the exact electrical angle of the rotor.
The encoder's zero position is arbitrary - it doesn't
align with the motor's electrical zero.

If the offset is wrong by 90 degrees, you apply
d-axis current instead of q-axis (no torque, lots of heat).


**Solution:**
```
// Angle calibration procedure
float calibrate_electrical_offset(void) {
    // 1. Apply d-axis current only
    // This aligns rotor to electrical zero
    float vd = 1.0;  // Small voltage
    float vq = 0.0;

    // Apply for 1 second (motor will align)
    for (int i = 0; i < 1000; i++) {
        float theta = 0;  // Force electrical angle to 0
        apply_voltage(vd, vq, theta);
        delay_ms(1);
    }

    // 2. Read encoder position
    // This is the offset
    float encoder_angle = get_encoder_angle();
    float electrical_offset = -encoder_angle * pole_pairs;

    // 3. Save offset
    save_to_flash(electrical_offset);
    return electrical_offset;
}

// Use calibrated offset in FOC
float get_electrical_angle(void) {
    float encoder_angle = get_encoder_angle();
    return (encoder_angle * pole_pairs) + electrical_offset;
}

```

**Symptoms:**
- Motor vibrates instead of spinning
- Low torque, high current
- Works in one direction, not the other

---

### [HIGH] Control loop can't track current dynamics, oscillates

**Why it happens:**
Motor electrical time constant: L/R (often 1-10ms)
Current loop bandwidth should be faster than this.

Rule of thumb:
- Current loop: 1-2 kHz bandwidth
- Sample rate: 10-20 kHz (10x bandwidth)

If loop is too slow, it can't control the current
before the motor's electrical dynamics change.


**Solution:**
```
// Motor electrical time constant
tau_e = L / R;  // e.g., 1mH / 1ohm = 1ms

// Current loop bandwidth: 2-5x faster than 1/tau_e
bw_current = 5 / tau_e;  // e.g., 5000 rad/s = 800 Hz

// Sample rate: 10x bandwidth
f_sample = 10 * bw_current / (2*pi);  // e.g., 8000 Hz

// Configure timer for 10kHz+ PWM and current loop
TIM1->PSC = 0;
TIM1->ARR = SystemCoreClock / 20000 - 1;  // 20kHz center-aligned = 10kHz effective

// Current loop gains (based on plant model)
// Plant: G(s) = 1/(Ls + R)
// PI controller: C(s) = kp + ki/s
// Target closed-loop bandwidth: 1kHz
kp = L * 2 * pi * 1000;  // L * target bandwidth
ki = R * 2 * pi * 1000;  // R * target bandwidth

```

**Symptoms:**
- Motor oscillates or vibrates
- Current waveform is distorted
- Worse at higher speeds

---

### [HIGH] Motor acting as generator raises bus voltage beyond safe level

**Why it happens:**
When motor decelerates (especially with load), it generates power.
This energy flows back to the DC bus, raising voltage.

If bus can't absorb energy (no battery, small capacitors),
voltage spikes above driver ratings.

Common in: robots stopping quickly, CNC decel, vehicle braking.


**Solution:**
```
// 1. Monitor bus voltage
float v_bus = read_bus_voltage();
if (v_bus > V_BUS_MAX * 0.9) {
    // Reduce braking torque
    iq_ref *= 0.5;
}

// 2. Add brake resistor circuit
// When v_bus > threshold, dump energy to resistor
void brake_resistor_control(float v_bus) {
    if (v_bus > V_BRAKE_THRESHOLD) {
        set_brake_resistor_pwm((v_bus - V_BRAKE_THRESHOLD) * 0.1);
    } else {
        set_brake_resistor_pwm(0);
    }
}

// 3. Size bus capacitance appropriately
// E = 0.5 * C * V^2
// For 1J of braking energy with 10V rise from 24V to 34V:
// C = 2 * E / (V2^2 - V1^2) = 2 / (34^2 - 24^2) = 3.4mF

// 4. Use regenerative-capable power supply or battery

```

**Symptoms:**
- Bus capacitors fail
- Driver overvoltage protection trips
- Controller resets during braking

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `PID|velocity loop|position loop|trajectory` | control-systems | Outer loop control design |
| `STM32|MCU|firmware|timer|ADC` | embedded-systems | Embedded implementation |
| `FPGA|Verilog|HDL|hardware PWM` | fpga-design | Hardware implementation |
| `ROS|ros2_control|robot` | ros2-robotics | ROS2 integration |

### Receives Work From

- **control-systems**: Implementing high-level motion control
- **embedded-systems**: Motor driver firmware
- **fpga-design**: Hardware motor controller

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/hardware/motor-control/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
