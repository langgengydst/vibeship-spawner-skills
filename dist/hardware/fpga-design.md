# FPGA Design

> Patterns for FPGA development including RTL design (Verilog/VHDL),
timing closure, clock domain crossing, high-level synthesis,
and verification. Covers both traditional HDL and modern HLS approaches.


**Category:** hardware | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Signals crossing clock domains without synchronization cause random failures

**Why it happens:**
When a signal changes near a clock edge, the flip-flop may
enter a metastable state - neither 0 nor 1.

This takes time to resolve (settling time). If another
flip-flop samples before resolution, you get random values.

Single-bit: Use 2-FF synchronizer
Multi-bit: Use async FIFO with Gray code pointers
Pulse: Convert to toggle, synchronize, edge-detect

CDC bugs are the #1 cause of "random" FPGA failures.


**Solution:**
```
// CORRECT: Use 2-FF synchronizer for single bit
(* ASYNC_REG = "TRUE" *)
reg [1:0] sync_chain;

always @(posedge clk_b) begin
    sync_chain <= {sync_chain[0], signal_a};
end
assign signal_b = sync_chain[1];

// For multi-bit data: use async FIFO
async_fifo #(.DATA_WIDTH(8)) fifo (
    .wr_clk(clk_a), .wr_data(data_a),
    .rd_clk(clk_b), .rd_data(data_b)
);

```

**Symptoms:**
- Random bit flips in data
- FSM enters invalid state
- Works on some boards, fails on others
- Failures increase with temperature

---

### [CRITICAL] Incomplete if/case creates latch instead of flip-flop

**Why it happens:**
In combinational logic, if a signal isn't assigned in all
branches, synthesis infers a latch to hold the previous value.

Latches are:
- Hard to analyze timing for
- Not available in all FPGA architectures
- Often indicate a design error

Almost always, you wanted a flip-flop or a complete assignment.


**Solution:**
```
// CORRECT: Assign default at start
always @(*) begin
    data_out = 8'h00;  // Default value
    if (enable)
        data_out = data_in;
end

// CORRECT: Complete case with default
always @(*) begin
    case (sel)
        2'b00: y = a;
        2'b01: y = b;
        default: y = 8'h00;  // Catch-all
    endcase
end

// CORRECT: Use full_case/parallel_case pragmas carefully
// (* full_case *) only if you guarantee coverage

```

**Symptoms:**
- Synthesis warning: 'latch inferred'
- Timing analysis fails
- Unexpected behavior after synthesis

---

### [CRITICAL] Design doesn't meet timing constraints, unreliable operation

**Why it happens:**
Timing closure means all paths meet setup/hold requirements.

Common causes of failure:
- Long combinational paths (too much logic between FFs)
- High fanout signals (driving many loads)
- Clock skew/uncertainty
- Missing or incorrect constraints

Negative slack = path too slow = unreliable operation.


**Solution:**
```
// CORRECT: Pipeline long operations
always @(posedge clk) begin
    // Stage 1
    mult1 <= a * b;
    mult2 <= c * d;

    // Stage 2
    sum1 <= mult1 + mult2;
    sum2 <= e + f;

    // Stage 3
    result <= sum1 + (sum2 * h);  // Simplified
end

// Reduce fanout with register duplication
// Let synthesis tool handle with: set_max_fanout 32

// Add proper timing constraints
// create_clock -period 10.0 [get_ports clk]

```

**Symptoms:**
- Negative slack in timing report
- Works at low temperature, fails when warm
- Works on some units, fails on others

---

### [HIGH] Releasing reset asynchronously causes metastability

**Why it happens:**
Asserting reset asynchronously is fine - it immediately resets.
But RELEASING reset at an arbitrary time can violate
recovery/removal timing on flip-flops.

Solution: Assert asynchronously, release synchronously.
This gives the reset assertion benefit (immediate) while
ensuring clean release aligned to clock.


**Solution:**
```
// CORRECT: Reset synchronizer
// Async assert, sync release

module reset_sync (
    input  wire clk,
    input  wire rst_n_async,
    output wire rst_n_sync
);
    reg [1:0] sync;

    always @(posedge clk or negedge rst_n_async) begin
        if (!rst_n_async)
            sync <= 2'b00;  // Async assert
        else
            sync <= {sync[0], 1'b1};  // Sync release
    end

    assign rst_n_sync = sync[1];
endmodule

// Use synchronized reset in design
reset_sync rst_sync (.clk(clk), .rst_n_async(rst_n), .rst_n_sync(rst_n_safe));

```

**Symptoms:**
- FSM starts in wrong state after reset
- Different behavior on different resets
- Works most of the time, occasionally fails

---

### [HIGH] Design works in simulation but fails on FPGA

**Why it happens:**
Common causes:
1. Non-synthesizable constructs (initial blocks, delays)
2. Incomplete sensitivity lists
3. Blocking vs non-blocking assignment confusion
4. X-propagation differences
5. Timing assumptions in testbench

Simulation is behavior model; synthesis creates actual hardware.


**Solution:**
```
// CORRECT: Use reset instead of initial
always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
        count <= 0;
    else
        count <= count + 1;
end

// CORRECT: Use @(*) for combinational
always @(*) begin  // All signals in sensitivity list
    y = a & b & c;
end

// CORRECT: Non-blocking for sequential
always @(posedge clk) begin
    a <= b;  // Non-blocking
    c <= a;  // Gets OLD value of a
end

```

**Symptoms:**
- Testbench passes, hardware fails
- Adding signals to debug changes behavior
- Different results from simulation and implementation

---

### [HIGH] Design uses more resources than available

**Why it happens:**
FPGAs have limited:
- LUTs (logic)
- FFs (registers)
- BRAM (block RAM)
- DSP slices (multipliers)

Over ~70-80% utilization, place-and-route struggles.
Common causes: unintended resource usage, inefficient coding.


**Solution:**
```
// Check resource usage in synthesis reports

// Efficient resource usage:
// 1. Use BRAM instead of distributed RAM for large memories
(* ram_style = "block" *) reg [7:0] mem [0:1023];

// 2. Share multipliers via time-division
always @(posedge clk) begin
    case (phase)
        0: product <= a * b;  // Reuse same DSP
        1: product <= c * d;
    endcase
end

// 3. Use inference patterns tools recognize
// Let synthesis optimize instead of manual optimization

// 4. Reduce bit widths where possible
reg [7:0] counter;  // Not reg [31:0] if you only count to 100

```

**Symptoms:**
- Synthesis fails with 'resource exceeded'
- Timing degrades as utilization increases
- Can't fit design even at lower clock speed

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `MCU|microcontroller|firmware` | embedded-systems | FPGA interfaces with MCU |
| `PID|control|MPC` | control-systems | Control algorithm design |
| `PCB|schematic|layout` | hardware-design | FPGA board design |

### Receives Work From

- **embedded-systems**: FPGA as coprocessor for MCU
- **control-systems**: Implement control algorithm in FPGA
- **sensor-fusion**: Hardware sensor preprocessing

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/hardware/fpga-design/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
