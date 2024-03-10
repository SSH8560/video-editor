import styles from "./AppFooter.module.css";

const AppFooter = ({}) => {
  return (
    <footer className={styles.app_footer}>
      <div className={styles.app_footer_container}>
        <div class="footer-section">
          <h3>사이트 정보</h3>
          <p>Video Editor로 간단한 비디오 편집을 웹에서 진행해보세요!</p>
        </div>

        <div class="footer-section">
          <h3>문의</h3>
          <ul class="social-icons">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Velog
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
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
