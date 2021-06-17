import json
import sys
from pathlib import Path

split_prefix = sys.argv[1]
durations_path = Path(sys.argv[2])

split_paths = Path(".").glob(f"{split_prefix}*/{durations_path}")
try:
    previous_durations = json.loads(durations_path.read_text())
except FileNotFoundError:
    previous_durations = {}

new_durations = previous_durations.copy()

for path in split_paths:
    durations = json.loads(path.read_text())
    new_durations.update(
        {
            name: duration
            for (name, duration) in durations.items()
            if previous_durations.get(name) != duration
        }
    )

with open(durations_path, "w") as f:
    json.dump(new_durations, f)
