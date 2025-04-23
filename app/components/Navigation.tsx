// components/Navigation.js
import Link from 'next/link';
import styles from './Navigation.module.css';

const Navigation = () => {
  return (
    <nav className={styles.navbar}>

      <Link href="/" className={styles.logoContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
          className={styles.logo}
        >
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
        </svg>
        <div className={styles.title}>Diamant</div>
      </Link>


      <div className={styles.right}>
        <Link className={styles.link} href="/">
          Main
        </Link>
        <Link className={styles.link} href="/posts">
          Posts
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;