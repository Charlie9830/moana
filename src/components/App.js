import '../assets/css/App.css';
import React from 'react';
import MoanaSrc from '../assets/video/moana.mp4';
import ReactPlayer from 'react-player';
import { ipcRenderer, remote } from 'electron';

const primaryChorusStartTime = 38;

class App extends React.Component {
  constructor(props) {
    super(props);

    // State.
    let workAreaSize = remote.screen.getPrimaryDisplay().workAreaSize;

    this.state = {
      playing: false,
      width: workAreaSize.width,
      height: workAreaSize.height,
    }



    this.isFirstPlay = true;
    this.primaryStartTime = primaryChorusStartTime;
    this.playTime = 4.5;
    this.isPlayingOut = false;

    // Refs.
    this.playerRef = null;
    this.setPlayerRef = (element) => {
      this.playerRef = element;
    }

    // Method Bindings.
    this.playMovie = this.playMovie.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
  }

  componentDidMount() {
    // Listen to Events from Main.
    ipcRenderer.on('play', (event, startTime) => {
      let startTimeInt = Number.parseInt(startTime);
      console.log(startTimeInt);
      this.playMovie(startTimeInt);
    })

    ipcRenderer.on('playout', (event) => {
      this.isPlayingOut = true;
      this.playMovie(160);
    })
  }

  render() {
    return (
      <div style={{overflowX: "hidden", overflowY: "hidden"}}>
        <ReactPlayer width={this.state.width} height={this.state.height} playing={this.state.playing} onPlay={this.handlePlay} onPause={this.handlePause}
         ref={this.setPlayerRef} url={MoanaSrc} preload="auto"/>
      </div>
    );
  }

  playMovie(startTime) {
    this.playerRef.seekTo(startTime);
    this.setState({ playing: true })
  }

  handlePlay() {
    if (this.isPlayingOut === false) {
      setTimeout(() => {
        this.setState({ playing: false })
      }, this.playTime * 1000);
    }

    else {
      // Special Playout.
      setTimeout(() => {
        ipcRenderer.send("ready-to-exit");
      }, 3250)
    }
  }

  handlePause() {
    ipcRenderer.send('finished');
  }
}

export default App;
