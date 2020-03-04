import React, { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const styles = {
  main: {
    textAlign: 'center',
  } as CSSProperties,
}

const About = () => {
  return (
    <div style={styles.main}>
      <p>Some explanation of how this works...</p>
      <p>Made at ETHLondon 2020 by Richard Brady, Rosco Kalis, Evert Kors and Kiki Cakir</p>
    </div>
  )
}

export default About
