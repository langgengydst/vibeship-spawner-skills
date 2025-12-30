# ROS2 Robotics

> Patterns for developing robotics applications with ROS2 (Robot Operating
System 2). Covers nodes, topics, services, actions, launch files, lifecycle
management, real-time considerations, and common pitfalls.


**Category:** hardware | **Version:** 1.0.0

---

## Patterns


## Sharp Edges (Gotchas)

*Real production issues that cause outages and bugs.*

### [CRITICAL] Mistyped topic name creates no connection and no error

**Why it happens:**
ROS2 doesn't validate topic names at compile or launch time.
If you type '/odom' in one place and '\odom' in another,
you get two separate topics with no warning.

Common typos:
- Missing leading slash: 'cmd_vel' vs '/cmd_vel'
- Underscore vs no underscore: 'laser_scan' vs 'laserscan'
- Namespace issues: '/robot1/cmd_vel' vs '/cmd_vel'

This is the #1 debugging issue for ROS beginners.


**Solution:**
```
# Use constants for topic names
class Topics:
    CMD_VEL = '/cmd_vel'
    ODOM = '/odom'
    SCAN = '/scan'

self.pub = self.create_publisher(Twist, Topics.CMD_VEL, 10)
self.sub = self.create_subscription(Twist, Topics.CMD_VEL, callback, 10)

# Use remapping in launch files for flexibility
# Verify with: ros2 topic list
# Check connections: ros2 topic info /topic_name --verbose

```

**Symptoms:**
- Publisher publishes but subscriber receives nothing
- Node appears to work but no data flows
- ros2 topic list shows separate topics

---

### [CRITICAL] Publisher and subscriber QoS incompatibility prevents connection

**Why it happens:**
ROS2 enforces QoS compatibility at connection time.
If publisher offers less than subscriber requires, no connection.

Most common mismatch:
- Publisher: BEST_EFFORT (sensor default)
- Subscriber: RELIABLE (default for many packages)

Result: Silent failure, no error message.


**Solution:**
```
# Check QoS with verbose info
# ros2 topic info /scan --verbose

# Match publisher's QoS
from rclpy.qos import qos_profile_sensor_data
self.sub = self.create_subscription(
    LaserScan, '/scan', callback,
    qos_profile_sensor_data  # Matches sensor publishers
)

# Or explicitly set compatible QoS
sensor_qos = QoSProfile(
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST,
    depth=10
)

```

**Symptoms:**
- ros2 topic list shows topic exists
- ros2 topic info shows both pub and sub
- No data flows, no error messages

---

### [HIGH] Long operations block all other callbacks

**Why it happens:**
ROS2 executors are single-threaded by default.
If one callback takes 1 second, ALL other callbacks wait.

This means:
- 100Hz control loop becomes 1Hz
- Watchdogs trigger
- Robot stops responding


**Solution:**
```
# Option 1: Use MultiThreadedExecutor
executor = MultiThreadedExecutor(num_threads=4)

# With separate callback groups
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup

self._sensor_group = MutuallyExclusiveCallbackGroup()
self._compute_group = MutuallyExclusiveCallbackGroup()

self.sub = self.create_subscription(
    ..., callback_group=self._sensor_group
)
self.timer = self.create_timer(
    0.01, self.control_callback,
    callback_group=self._compute_group
)

# Option 2: Async callbacks (ROS2 Humble+)
async def callback(self, msg):
    result = await asyncio.to_thread(self.expensive_computation, msg)

```

**Symptoms:**
- Timer callbacks become irregular
- Subscribers stop receiving messages
- Node becomes unresponsive

---

### [HIGH] Missing TF transform blocks forever

**Why it happens:**
lookup_transform with default timeout blocks forever if
the transform doesn't exist. This can happen:
- During startup (TF not published yet)
- If publishing node dies
- If frame name is wrong

No error is raised until you interrupt.


**Solution:**
```
# Always use timeout
try:
    transform = self.tf_buffer.lookup_transform(
        'map', 'base_link',
        rclpy.time.Time(),
        timeout=rclpy.duration.Duration(seconds=1.0)
    )
except TransformException as e:
    self.get_logger().warning(f'Transform failed: {e}')
    return  # Handle gracefully

# Check if transform exists before lookup
if self.tf_buffer.can_transform('map', 'base_link', rclpy.time.Time()):
    transform = self.tf_buffer.lookup_transform(...)

```

**Symptoms:**
- Node hangs waiting for transform
- No error until Ctrl+C
- Works sometimes, hangs other times

---

### [MEDIUM] get_parameter fails if parameter not declared first

**Why it happens:**
ROS2 requires parameters to be declared before use.
This is different from ROS1's dynamic parameters.

If you try to get an undeclared parameter, you get
an exception, not a default value.


**Solution:**
```
# Declare parameter first
self.declare_parameter('max_speed', 1.0)  # With default
speed = self.get_parameter('max_speed').value

# Or declare without default (requires YAML)
self.declare_parameter('max_speed')

# Bulk declaration
self.declare_parameters('', [
    ('max_speed', 1.0),
    ('min_speed', 0.1),
    ('topic_name', '/cmd_vel')
])

```

**Symptoms:**
- ParameterNotDeclaredException on startup
- Works in some nodes, fails in others
- Parameter files seem ignored

---

### [HIGH] Requesting latest transform can get stale data

**Why it happens:**
Time(0) means "give me the latest available transform."
But if you're processing a sensor message from 100ms ago,
the latest TF might be 100ms newer than your data.

This causes sensor data to be in the wrong place.


**Solution:**
```
# Use message timestamp for transform lookup
def sensor_callback(self, msg):
    try:
        # Use sensor message timestamp
        transform = self.tf_buffer.lookup_transform(
            'map',
            msg.header.frame_id,
            msg.header.stamp,  # Sensor timestamp, not Time(0)
            timeout=Duration(seconds=0.1)
        )
    except TransformException as e:
        self.get_logger().warning(f'TF lookup failed: {e}')

```

**Symptoms:**
- Transform is slightly behind
- Sensor data doesn't align with transform
- Inconsistent behavior with sim vs real

---

## Collaboration

### When to Hand Off

| Trigger | Delegate To | Context |
|---------|-------------|--------|
| `sensor fusion|localization|EKF` | sensor-fusion | Need sensor data fusion |
| `control|PID|MPC` | control-systems | Need control algorithm design |
| `motor|actuator|servo` | motor-control | Need motor controller interface |
| `embedded|microcontroller|real-time` | embedded-systems | Need embedded system integration |

### Receives Work From

- **embedded-systems**: Need ROS2 interface for embedded controller
- **sensor-fusion**: Need sensor data published to ROS2

---

## Get the Full Version

This skill has **automated validations**, **detection patterns**, and **structured handoff triggers** that work with the Spawner orchestrator.

```bash
npx vibeship-spawner-skills install
```

Full skill path: `~/.spawner/skills/hardware/ros2-robotics/`

**Includes:**
- `skill.yaml` - Structured skill definition
- `sharp-edges.yaml` - Machine-parseable gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Handoff triggers for skill orchestration

---

*Generated by [VibeShip Spawner](https://github.com/vibeforge1111/vibeship-spawner-skills)*
