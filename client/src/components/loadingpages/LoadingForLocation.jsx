import React from 'react';
import { FaCar, FaBicycle, FaLaptop, FaMobileAlt } from 'react-icons/fa'; // Importing React Icons

const animationStyles = `
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes rotateIcon {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

function LoadingPage() {
  return (
    <div style={styles.container}>
      <style>{animationStyles}</style>
      {/* <h2 style={styles.title}>Loading Products...</h2> */}
      <div style={styles.iconsContainer}>
        <div style={styles.iconWrapper}>
          <FaCar style={{ ...styles.icon, color: '#ff6347', animationDelay: '0s' }} />
        </div>
        <div style={styles.iconWrapper}>
          <FaBicycle style={{ ...styles.icon, color: '#32cd32', animationDelay: '0.5s' }} />
        </div>
        <div style={styles.iconWrapper}>
          <FaLaptop style={{ ...styles.icon, color: '#1e90ff', animationDelay: '1s' }} />
        </div>
        <div style={styles.iconWrapper}>
          <FaMobileAlt style={{ ...styles.icon, color: '#ffcc00', animationDelay: '1.5s' }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'auto',
    backgroundColor: 'transparent', 
    flexDirection: 'column',
    overflow: 'hidden',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#007bff',
  },
  iconsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0px',
    animation: 'fadeIn 2s ease-in-out',
  },
  iconWrapper: {
    margin: '0 15px',  // Space out the icons
    animation: 'rotate 3s infinite ease-in-out',
  },
  icon: {
    fontSize: '16px', // Smaller icons
    transition: 'transform 0.5s ease-in-out',
    animation: 'rotateIcon 2s infinite linear',
  },
};

export default LoadingPage;
