import React from 'react';
import profilePic from '../assets/profile-pic.jpg';
import { rhythm } from '../utils/typography';

class Bio extends React.Component {
  render() {
    const { langKey } = this.props;
    const hasTelegram = langKey === 'ru';

    return (
      <div
        style={{
          display: 'flex',
          marginBottom: rhythm(2),
        }}
      >
        <img
          src={profilePic}
          alt={`Dmitry Manannikov`}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
            borderRadius: '50%',
          }}
        />
        <p>
          Personal blog by Dmitry Manannikov. All around Web and software
          development.{' '}
          <a href="https://github.com/slonoed" rel="noopener noreferrer">
            GitHub
          </a>
          .{' '}
          <a href="https://twitter.com/slonoed" rel="noopener noreferrer">
            Twitter
          </a>
          .{' '}
          {hasTelegram && (
            <>
              <a href="http://t.me/slonoed" rel="noopener noreferrer">
                Telegram
              </a>
              .
            </>
          )}
        </p>
      </div>
    );
  }
}

export default Bio;
