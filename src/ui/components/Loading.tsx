import { useState } from "react";
import { useEventsListeners } from "../../utils/events";
import { UIEvents } from "../../constants/events";

export const Loading = () => {
  const [value, setValue] = useState(0);

  const getPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  useEventsListeners(
    [
      {
        name: UIEvents.LOADING_PROGRESS,
        callback: (event: CustomEvent) => {
          setValue(event.detail);
        },
      },
    ],
    [],
  );

  return (
    <div className="loading loading-gba">
      <div className="loading-gba-screen">
        <div className="loading-inner">
          <div className="loading-title">SILVERTOWN</div>
          <div className="loading-subtitle">A portfolio by Matt Silverman</div>
          <div className="loading-gba-bar">
            <div
              className="loading-gba-bar-fill"
              style={{ width: getPercentage(value) }}
            />
          </div>
          <div className="loading-percent">{getPercentage(value)}</div>
        </div>
      </div>
    </div>
  );
};
