import React, {useEffect} from "react";

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

    let signal1 = {
        userId: "",
        type: "",
        data: "",
        toUid: "",
    };

    const startWebSocket = () => {
        try {
            let socketAddr = "ws://localhost:8080/webrtc"
            const ws = new WebSocket(socketAddr);
            ws.onopen = event => {
                signal1.userId = '';
                signal1.type = 'Login';
                signal1.data = '';
                console.log(JSON.stringify(signal1));
                ws.send(JSON.stringify(signal1));
            }
            ws.onerror = (event) => {
                console.log(JSON.stringify(event))
            }
            ws.onclose = (e) => {
                console.log(`onclose : ${JSON.stringify(e)}`)
            }
            ws.onmessage = (e) => {
                const dataFromServer = JSON.parse(e.data);
                alert(JSON.stringify(dataFromServer))
            }


        }catch(e){
            alert("##")
            console.log(e)
        }
    }

    useEffect(() => {
        startWebSocket()
    },[])

    return (
        <div>
            {/*<video id={"localVideo"} autoPlay muted></video>*/}
            {/*<video id={"remoteVideo"} autoPlay></video>*/}
            {/*<button onClick={onStartButtonClicked} id="startButton">Start</button>*/}
            {/*<button onClick={onCallButtonClicked} id="callButton">Call</button>*/}
            {/*<button onClick={onHangupButtonClicked} id="hangupButton">Hang Up</button>*/}
        </div>
    )
}
