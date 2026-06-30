import json
import sys
from pathlib import Path

artifacts_path = Path(sys.argv[1])
durations_path = Path(sys.argv[2])

current_path = Path(".").resolve()
print(
    f"Combining durations with artifacts-path={artifacts_path} and"
    f" durations-path={durations_path} in {current_path}."
)
# `**` matches zero or more directories, so this finds the durations file whether
# download-artifact nested it under a per-split directory (multiple splits) or
# extracted it directly into the artifacts path (a single split collapses the dir).
split_paths = artifacts_path.glob(f"**/{durations_path.name}")
try:
    previous_durations = json.loads(durations_path.read_text())
    print(
        f"Loaded previous durations from {durations_path}, found"
        f" {len(previous_durations)} test durations."
    )
except FileNotFoundError:
    previous_durations = {}
    print("Previous durations not found, this seems to be the first run.")


new_durations = previous_durations.copy()

for path in split_paths:
    durations = json.loads(path.read_text())
    updated_durations = {
        name: duration
        for (name, duration) in durations.items()
        if previous_durations.get(name) != duration
    }
    new_durations.update(updated_durations)
    print(
        f"Updated durations from {path} containing {len(updated_durations)} changed"
        " test durations."
    )

durations_path.parent.mkdir(parents=True, exist_ok=True)
durations_path.write_text(json.dumps(new_durations))
print(f"Saved {len(new_durations)} updated durations to {durations_path}.")
