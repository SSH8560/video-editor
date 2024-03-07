import { useState } from "react";
import styles from "./EditResolution.module.css";

const EditResolution = ({ resolution, setResolution }) => {
  const [aspectRatio, setAspectRatio] = useState();

  return (
    <div className={styles.edit_resolution}>
      <label htmlFor="use_ratio">비율 유지</label>
      <input
        id="use_ratio"
        type="checkbox"
        checked={!!aspectRatio}
        onChange={(e) => {
          if (aspectRatio) {
            setAspectRatio(undefined);
          } else {
            setAspectRatio(resolution[0] / resolution[1]);
          }
        }}
      />
      <label htmlFor="width">가로</label>
      <input
        id="width"
        className={styles.input}
        type="number"
        value={resolution[0]}
        onChange={(e) =>
          setResolution([
            e.target.value,
            Math.floor(e.target.value / aspectRatio) || resolution[1],
          ])
        }
      />
      <label htmlFor="height">세로</label>
      <input
        id="height"
        className={styles.input}
        type="number"
        value={resolution[1]}
        onChange={(e) =>
          setResolution([
            Math.floor(e.target.value * aspectRatio) || resolution[0],
            e.target.value,
          ])
        }
      />
    </div>
  );
};
export default EditResolution;
