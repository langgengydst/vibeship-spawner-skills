# Embedded Systems

> Patterns for embedded software development including real-time systems,
memory management, hardware abstraction, interrupt handling, and
debugging techniques for resource-constrained environments.


**Category:** hardware | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Compiler caches variable in register, ISR updates memory, main loop never sees change

**Why it happens:**
Without 'volatile', the compiler assumes no external modification.
It optimizes by reading the variable once into a register.

The ISR modifies memory, but main loop reads stale register.
This is the most common embedded bug and hardest to debug
because it works at -O0 and fails at -O2.


**Solution:**
```
// Always use volatile for ISR-shared variables
volatile bool data_ready = false;

// For multi-word data, volatile alone isn't enough
// Need critical section too (see race-condition edge)

// Rule: If ANY interrupt can modify it, it's volatile

```

**Symptoms:**
- Flag set in ISR but main loop never detects it
- Works with -O0, fails with -O2
- Adding printf makes it work (timing change)

---

### [CRITICAL] Stack grows into heap/data, no error, random crashes later

**Why it happens:**
Embedded systems have small stacks (often 1-4KB).
Stack overflow doesn't trigger an error - it just
writes over whatever memory is below the stack.

This corrupts heap, global variables, or other stacks.
Symptoms appear far from the actual overflow point.

Common causes:
- Large local arrays
- Deep recursion
- Printf (uses 1KB+ stack)
- Nested interrupts


**Solution:**
```
// 1. Use static/global for large buffers
static uint8_t buffer[2048];  // In .bss, not stack

// 2. Monitor stack usage
void init_stack_monitor(void) {
    extern uint32_t _estack, _Min_Stack_Size;
    uint32_t* bottom = &_estack - (uint32_t)&_Min_Stack_Size/4;
    for (uint32_t* p = bottom; p < &_estack - 64; p++)
        *p = 0xDEADBEEF;  // Canary pattern
}

uint32_t check_stack_usage(void) {
    extern uint32_t _estack, _Min_Stack_Size;
    uint32_t* p = &_estack - (uint32_t)&_Min_Stack_Size/4;
    while (*p == 0xDEADBEEF) p++;
    return (&_estack - p) * 4;  // Bytes used
}

// 3. Use -fstack-usage compiler flag
// Generates .su files with per-function stack usage

```

**Symptoms:**
- Random crashes, different each time
- Works until you add a local array
- Crashes in unrelated functions
- Works in debug, fails in release

---

### [CRITICAL] ISR interrupts between reading high/low bytes, corrupted value

**Why it happens:**
On 32-bit MCU, 64-bit access is two instructions.
On 8-bit MCU, even 16-bit is two instructions.

If ISR fires between instructions, you get:
- Old high byte + new low byte, or
- New high byte + old low byte

Result: Completely wrong value, hard to reproduce.


**Solution:**
```
// Use critical sections for multi-word access
uint32_t read_timestamp_safe(void) {
    uint32_t primask = __get_PRIMASK();
    __disable_irq();

    uint32_t ts = timestamp;  // Now atomic

    __set_PRIMASK(primask);
    return ts;
}

// Or use double-read pattern (no interrupt disable)
uint32_t read_timestamp_lockfree(void) {
    uint32_t a, b;
    do {
        a = timestamp;
        b = timestamp;
    } while (a != b);  // Retry if ISR interrupted
    return a;
}

// For structs, copy entire struct atomically
typedef struct {
    uint32_t timestamp;
    int16_t x, y, z;
} sensor_data_t;

sensor_data_t read_sensor_safe(void) {
    sensor_data_t copy;
    __disable_irq();
    copy = sensor_data;  // Struct copy
    __enable_irq();
    return copy;
}

```

**Symptoms:**
- Occasional wrong values (1 in 1000)
- Values jump unexpectedly
- 32-bit value has wrong upper 16 bits

---

### [HIGH] Blocking operation exceeds watchdog timeout, system resets

**Why it happens:**
Watchdog must be fed within timeout (typically 1-10 seconds).
Long operations (flash writes, crypto, large transfers)
can exceed this, causing unexpected reset.

Worse: Reset clears evidence of what happened.


**Solution:**
```
void update_firmware_safe(uint8_t* data, size_t len) {
    flash_erase_sector(0x08010000);
    watchdog_feed();  // Feed after each long operation

    for (int i = 0; i < len; i += 256) {
        flash_write_page(0x08010000 + i, &data[i], 256);

        if (i % 2048 == 0) {  // Every 8 pages
            watchdog_feed();
        }
    }
    watchdog_feed();
}

// For unpredictable operations, use windowed watchdog
// or feed from timer ISR (risky - can mask hangs)

```

**Symptoms:**
- Random resets during certain operations
- Resets when processing large data
- Works with watchdog disabled

---

### [HIGH] Printf is not reentrant, ISR corrupts main code's printf state

**Why it happens:**
Printf maintains internal state (buffers, format parsing).
It's not reentrant - calling from ISR while main uses it
corrupts that state.

Also: Printf typically blocks waiting for UART, which
defeats the purpose of a quick ISR.


**Solution:**
```
// Option 1: Buffer for deferred printing
volatile char debug_buffer[64];
volatile uint8_t debug_head = 0;

void UART_IRQHandler(void) {
    debug_buffer[debug_head++] = UART->DR;
    debug_head &= 0x3F;  // Wrap
}

void main_loop(void) {
    // Print from main context
    static uint8_t debug_tail = 0;
    while (debug_tail != debug_head) {
        printf("Received: %c\n", debug_buffer[debug_tail++]);
        debug_tail &= 0x3F;
    }
}

// Option 2: SEGGER RTT (non-blocking, ISR-safe)
#include "SEGGER_RTT.h"
void UART_IRQHandler(void) {
    SEGGER_RTT_printf(0, "RX: %c\n", UART->DR);  // Safe!
}

// Option 3: Toggle GPIO pin for timing debug
void UART_IRQHandler(void) {
    GPIO_SET(DEBUG_PIN);   // Scope can measure
    // ... handler code ...
    GPIO_CLEAR(DEBUG_PIN);
}

```

**Symptoms:**
- Crash during printf
- Garbled output
- Deadlock waiting for UART
- Works sometimes, crashes other times

---

### [HIGH] Accessing peripheral before enabling its clock causes hard fault

**Why it happens:**
Peripherals are clock-gated for power savings.
Accessing a peripheral with clock disabled causes
a bus fault - the peripheral literally doesn't respond.

Easy to forget clock enable, especially when copy-pasting code.


**Solution:**
```
void init_uart(void) {
    // Always enable clock FIRST
    RCC->APB2ENR |= RCC_APB2ENR_USART1EN;

    // Small delay for clock to stabilize
    __NOP(); __NOP();

    // Now safe to access
    USART1->BRR = 0x1A1;
    USART1->CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;
}

// Use HAL functions that handle this automatically
__HAL_RCC_USART1_CLK_ENABLE();

```

**Symptoms:**
- Hard fault on first peripheral access
- Bus error at specific address
- Works after reset, fails on warm boot

---

### [MEDIUM] Casting byte pointer to word pointer causes alignment fault

**Why it happens:**
ARM Cortex-M (and many other CPUs) require aligned access:
- 32-bit access must be 4-byte aligned
- 16-bit access must be 2-byte aligned

Casting a byte buffer to uint32_t* and dereferencing
causes hard fault if buffer isn't aligned.


**Solution:**
```
// Option 1: Use memcpy (compiler handles alignment)
void process_packet(uint8_t* data) {
    uint32_t magic;
    memcpy(&magic, data, sizeof(magic));  // Safe!
}

// Option 2: Use packed struct with attribute
typedef struct __attribute__((packed)) {
    uint32_t magic;
    uint16_t length;
    uint8_t data[];
} packet_t;

// Option 3: Ensure alignment at allocation
uint8_t buffer[10] __attribute__((aligned(4)));

// Option 4: Use byte-by-byte access
uint32_t read_u32_unaligned(uint8_t* p) {
    return p[0] | (p[1] << 8) | (p[2] << 16) | (p[3] << 24);
}

```

**Symptoms:**
- Hard fault on memory access
- Works on x86, fails on ARM
- Crashes when buffer address is odd

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `ROS|robot|micro-ROS` | ros2-robotics | Need ROS2 integration |
| `PID|control loop|MPC` | control-systems | Need control algorithm design |
| `FPGA|hardware acceleration|HDL` | fpga-design | Need FPGA coprocessor |
| `motor|servo|stepper|brushless` | motor-control | Need motor driver implementation |
| `Kalman|sensor fusion|IMU fusion` | sensor-fusion | Need sensor fusion algorithm |

### Receives Work From

- **ros2-robotics**: Need micro-ROS node or hardware driver
- **control-systems**: Implement control algorithm on MCU
- **sensor-fusion**: Run sensor fusion on embedded

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/hardware/embedded-systems/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
