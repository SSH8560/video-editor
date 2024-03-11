import styles from "./AppFooter.module.css";

const AppFooter = ({}) => {
  return (
    <footer className={styles.app_footer}>
      <div className={styles.app_footer_container}>
        <div class="info">
          <h3>사이트 정보</h3>
          <p>Video Editor로 간단한 비디오 편집을 웹에서 진행해보세요!</p>
        </div>
        <div class="contact">
          <h3>문의</h3>
          <ul class="contact_list">
            <li>Email : ssh8560@naver.com</li>
            <li>
              <a
                href="https://velog.io/@ssh8560/posts"
                target="_blank"
                rel="noopener noreferrer"
              >
                Velog
              </a>
            </li>
            <li>
              <a
                href="https://github.com/SSH8560"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
export default AppFooter;
