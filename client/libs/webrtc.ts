// export let localVideo: RefObject<HTMLVideoElement> | null
// export let remoteVideo: RefObject<HTMLVideoElement> | null
export const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
// const startButton = document.getElementById('startButton') as HTMLButtonElement;
// const callButton = document.getElementById('callButton') as HTMLButtonElement;
// const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;

let startTime: number;
let localStream: MediaStream;
let pc1: RTCPeerConnection | undefined;
let pc2: RTCPeerConnection | undefined;
let offerOptions: RTCOfferOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
};

// startButton.addEventListener('click', start);
// callButton.addEventListener('click', call);
// hangupButton.addEventListener('click', hangup);

export function start() {
    console.log('Requesting local stream');
    // startButton.disabled = true;
    
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true,
        })
        .then(gotStream)
        .catch(e => {
            alert(`getUserMedia() error: ${e}`);
        });
}

function gotStream(stream: MediaStream) {

    if (localVideo === null) return;

    localVideo.srcObject = stream;
    localStream = stream;
    // callButton.disabled = false;
}

export function call() {
    // callButton.disabled = true;
    // hangupButton.disabled = false;
    console.log('Starting call');
    startTime = window.performance.now();
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
    }

    const servers: RTCConfiguration = {
        iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
        ],
    };

    pc1 = new RTCPeerConnection(servers);
    console.log('Created local peer connection object pc1');
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1!!, e));
    pc2 = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object pc2');
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2!!, e));
    pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1!!, e));
    pc2.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc2!!, e));
    pc2.addEventListener('track', gotRemoteStream);

    localStream.getTracks().forEach(track => pc1?.addTrack(track, localStream));
    console.log('Added local streamto pc1');

    console.log('pc1 createOffer start');
    pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error: any) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc: RTCSessionDescriptionInit) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    pc1?.setLocalDescription(desc).then(
        () => onSetLocalSuccess(pc1!!),
        onSetSessionDescriptionError
    );
    console.log('pc2 setRemoteDescription start');
    pc2?.setRemoteDescription(desc).then(
        () => onSetRemoteSuccess(pc2!!),
        onSetSessionDescriptionError
    );
    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    pc2?.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onCreateAnswerSuccess(desc: RTCSessionDescriptionInit) {
    console.log(`Answer from pc2:\n${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    pc2?.setLocalDescription(desc).then(
        () => onSetLocalSuccess(pc2!!),
        onSetSessionDescriptionError
    );
    console.log('pc1 setRemoteDescription start');
    pc1?.setRemoteDescription(desc).then(
        () => onSetRemoteSuccess(pc1!!),
        onSetSessionDescriptionError
    );
}

function onSetLocalSuccess(pc: RTCPeerConnection) {
    console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc: RTCPeerConnection) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error: any) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e: RTCTrackEvent) {

    if (remoteVideo === null) return;

    if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        console.log('pc2 received remote stream');
    }
}

function onIceCandidate(pc: RTCPeerConnection, event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
        getOtherPc(pc)?.addIceCandidate(event.candidate)
            .then(
                () => onAddIceCandidateSuccess(pc),
                err => onAddIceCandidateError(pc, err)
            );
        console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
}


function onAddIceCandidateSuccess(pc: RTCPeerConnection) {
    console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc: RTCPeerConnection, error: any) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc: RTCPeerConnection, event: any) {
    if (pc) {
        console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
        console.log('ICE state change event: ', event);
    }
}

export function hangup() {
    console.log('Ending call');
    pc1?.close();
    pc2?.close();
    pc1 = undefined;
    pc2 = undefined;
    //TODO: -
    // hangupButton.disabled = true;
    // callButton.disabled = false;
}

function getName(pc: RTCPeerConnection) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc: RTCPeerConnection) {
    return (pc === pc1) ? pc2 : pc1;
}