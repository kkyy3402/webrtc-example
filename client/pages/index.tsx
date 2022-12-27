import React from "react";

export default function Home() {


    const onStartButtonClicked = () => {
        import('../libs/webrtc').then(webRtcLib => {
            webRtcLib.start()
        });
    }

    const onCallButtonClicked = () => {
        import('../libs/webrtc').then(webRtcLib => {
            webRtcLib.call()
        });
    }

    const onHangupButtonClicked = () => {
        import('../libs/webrtc').then(webRtcLib => {
            webRtcLib.hangup()
        });
    }

    return (
        <div>
            <video id={"localVideo"} autoPlay muted></video>
            <video id={"remoteVideo"} autoPlay></video>
            <button onClick={onStartButtonClicked} id="startButton">Start</button>
            <button onClick={onCallButtonClicked} id="callButton">Call</button>
            <button onClick={onHangupButtonClicked} id="hangupButton">Hang Up</button>
        </div>
    )
}
