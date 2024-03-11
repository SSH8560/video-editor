import { useEffect, useState } from "react";
import { fetchVideoFilesList } from "../libs/actions";
import { Button, Card, Modal } from "react-bootstrap";

import styles from "./GoogleDriveFilesList.module.css";

const GoogleDriveFilesList = ({ onClickFile, onClickCancelButton }) => {
  const [fileList, setFileList] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const { accessToken } = JSON.parse(sessionStorage.getItem("token"));
    fetch();

    async function fetch() {
      const files = await fetchVideoFilesList(accessToken);
      console.log(files);
      setFileList(files);
    }
  }, []);

  const processedFileList = fileList.filter((it) => it.name.includes(query));

  return (
    <>
      <Modal.Header>
        <div className={styles.query}>
          <label className={styles.query_label} htmlFor="queryInput">
            검색어
          </label>
          <input
            id="queryInput"
            className={styles.query_input}
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.container}>
          <ul className={styles.list}>
            {processedFileList.map((it) => {
              return (
                <li
                  className={styles.list_item}
                  onClick={() => onClickFile(it.id)}
                >
                  <Card>
                    <Card.Img
                      className={styles.file_thumbnail_img}
                      alt={it.name}
                      src={it.thumbnailLink}
                    ></Card.Img>
                    <Card.Body>{it.name}</Card.Body>
                  </Card>
                </li>
              );
            })}
          </ul>
          <div className={styles.footer}></div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => onClickCancelButton()}>
          취소
        </Button>
      </Modal.Footer>
    </>
  );
};

export default GoogleDriveFilesList;
