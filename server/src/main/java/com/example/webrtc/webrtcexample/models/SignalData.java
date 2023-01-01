package com.example.webrtc.webrtcexample.models;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignalData {

    private String userId;
    private String type;
    private String data;
    private String toUid;
}