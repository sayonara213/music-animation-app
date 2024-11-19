import { cx } from 'class-variance-authority'
import React from 'react'

interface IFreqBlobProps {
  volume: number
  className: string
  color: string
}

export const FreqBlob: React.FC<IFreqBlobProps> = ({ volume, className, color }) => {
  return (
    <div
      style={{
        backgroundColor: color,
        width: `${volume}px`,
        height: `${volume}px`,
      }}
      className={cx('rounded-full  blur-3xl ', className)}
    />
  )
}
