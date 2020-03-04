import React, { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import logo from '../logo.svg'

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    width: '40%',
    minWidth: '300px',
    margin: 'auto',
  },
  description: {
    textAlign: 'center',
  } as CSSProperties,
  menu: {
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,
  link: {
    textDecoration: 'none',
    color: '#000',
    margin: '5px 0'
  }
}

const Header = () => {
  return (
    <div style={styles.header}>
      <div style={styles.menu}>{/* Filler */}</div>
      <div>
        <img style={styles.logo} src={logo} alt="logo" />
        <p style={styles.description}>The best way to monetize your domain!</p>
      </div>
      <div style={styles.menu}>
        <Link style={styles.link} to="/">Search Domain</Link>
        <Link style={styles.link} to="/about">About</Link>
        <a style={styles.link} href="https://github.com/rkalis/radical.domains">Source Code</a>
      </div>
    </div>
  )
}

export default Header
