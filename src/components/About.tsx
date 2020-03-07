import React, { CSSProperties } from 'react'

const styles = {
  main: {
    textAlign: 'center',
  } as CSSProperties,
}

const About = () => {
  return (
    <div style={styles.main}>
      {/* TOD: Some explanation */}
      <p>Made at ETHLondon 2020 by Richard Brady, Rosco Kalis, Evert Kors and Kiki Cakir</p>
    </div>
  )
}

export default About
