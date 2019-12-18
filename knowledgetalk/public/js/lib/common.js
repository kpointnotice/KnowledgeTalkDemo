const logBox = (type, text) => {
  const printBox = document.getElementById("printbox");
  let logText = JSON.stringify(text);
  let logJson = JSON.parse(logText);
//   if (logJson.eventOp === "SDP") {
//     if (logJson.sdp && logJson.sdp.sdp) {
//       logJson.sdp.sdp = "sdp...";
//     }
//   }

//   if (logJson.eventOp === "Candidate") {
//     if (logJson.candidate) {
//       logJson.candidate = "candidate...";
//     }
//   }

//   if (logJson.eventOp === "ScreenShare") {
//     if (logJson.sdp && logJson.sdp.sdp) {
//       logJson.sdp.sdp = "sdp...";
//     }
//   }

  logText = JSON.stringify(logJson);
  logText = `[${nowTime()}] [${type}] message: ${logText}`;
  let _t = document.createTextNode(logText);
  printBox.appendChild(document.createElement("p").appendChild(_t));
  printBox.appendChild(document.createElement("br"));
  printBox.appendChild(document.createElement("br"));
}

const nowTime = () => {
  var today = new Date();
  var hh = today.getHours();
  var MM = today.getMinutes() + 1;
  var ss = today.getSeconds();

  if (hh < 10) {
    hh = "0" + hh;
  }
  if (MM < 10) {
    MM = "0" + MM;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }

  return hh + ":" + MM + ":" + ss;
}

let bitrateSeries = {};
let bitrateGraph = {};
let packetSeries = {};
let packetGraph = {};
let lastResult = {};
let graphInterval = {};

const internalGraph = (id, peer) => {
  // const graphbox = document.getElementById("graphbox");
  // const graphcontainer = `<div class="graph-container" id="bitrateGraph-${id}">
  //   <div>outbound Bitrate</div>
  //   <canvas id="bitrateCanvas-${id}"></canvas>
  // </div>
  // <div class="graph-container" id="packetGraph-${id}">
  //   <div>outbound Packets sent per second</div>
  //   <canvas id="packetCanvas-${id}"></canvas>
  // </div>`;
  // graphbox.insertAdjacentHTML('beforeend', graphcontainer);

  bitrateSeries[id] = new TimelineDataSeries();
  bitrateGraph[id] = new TimelineGraphView('bitrateGraph-'+id, 'bitrateCanvas-'+id);
  bitrateGraph[id].updateEndDate();
  
  packetSeries[id] = new TimelineDataSeries();
  packetGraph[id] = new TimelineGraphView('packetGraph-'+id, 'packetCanvas-'+id);
  packetGraph[id].updateEndDate();
  
  graphInterval[id] = window.setInterval(() => {
    if (!peer) {
      return;
    }
    const RtpSender = peer.getSenders();
    let sender;
    RtpSender.some(item => {
      if (item.track.kind === "video") {
        return sender = item;
      }
    });
  
    if (!sender) {
      return;
    }
    sender.getStats().then(res => {
      res.forEach(report => {
        let bytes;
        let packets;
        if (report.type === 'outbound-rtp') {
          if (report.isRemote) {
            return;
          }
          const now = report.timestamp;
          bytes = report.bytesSent;
          packets = report.packetsSent;
          if (lastResult[id] && lastResult[id].has(report.id)) {
            // calculate bitrate
            const bitrate = 8 * (bytes - lastResult[id].get(report.id).bytesSent) /
              (now - lastResult[id].get(report.id).timestamp);
  
            // append to chart
            bitrateSeries[id].addPoint(now, bitrate);
            bitrateGraph[id].setDataSeries([bitrateSeries[id]]);
            bitrateGraph[id].updateEndDate();
  
            // calculate number of packets and append to chart
            packetSeries[id].addPoint(now, packets -
              lastResult[id].get(report.id).packetsSent);
            packetGraph[id].setDataSeries([packetSeries[id]]);
            packetGraph[id].updateEndDate();
          }
        }
      });
      lastResult[id] = res;
    });
  }, 1000);
}

const internalRemoteGraph = (id, peer) => {
  // const graphbox = document.getElementById("graphbox");
  // const graphcontainer = `<div class="graph-container" id="bitrateGraph-${id}">
  //   <div>${id} Bitrate</div>
  //   <canvas id="bitrateCanvas-${id}"></canvas>
  // </div>
  // <div class="graph-container" id="packetGraph-${id}">
  //   <div>${id} Packets sent per second</div>
  //   <canvas id="packetCanvas-${id}"></canvas>
  // </div>`;
  // graphbox.insertAdjacentHTML('beforeend', graphcontainer);

  bitrateSeries[id] = new TimelineDataSeries();
  bitrateGraph[id] = new TimelineGraphView('bitrateGraph-'+id, 'bitrateCanvas-'+id);
  bitrateGraph[id].updateEndDate();
  
  packetSeries[id] = new TimelineDataSeries();
  packetGraph[id] = new TimelineGraphView('packetGraph-'+id, 'packetCanvas-'+id);
  packetGraph[id].updateEndDate();
  
  graphInterval[id] = window.setInterval(() => {
    if (!peer) {
      return;
    }
    const RtpSender = peer.getReceivers();
    let receiver;
    RtpSender.some(item => {
      if (item.track.kind === "video") {
        return receiver = item;
      }
    });
  
    if (!receiver) {
      return;
    }
    receiver.getStats().then(res => {
      res.forEach(report => {
        let bytes;
        let packets;
        if (report.type === 'inbound-rtp') {
          if (report.isRemote) {
            return;
          }
          const now = report.timestamp;
          bytes = report.bytesReceived;
          packets = report.packetsReceived;
          if (lastResult[id] && lastResult[id].has(report.id)) {
            // calculate bitrate
            const bitrate = 8 * (bytes - lastResult[id].get(report.id).bytesReceived) /
              (now - lastResult[id].get(report.id).timestamp);
  
            // append to chart
            bitrateSeries[id].addPoint(now, bitrate);
            bitrateGraph[id].setDataSeries([bitrateSeries[id]]);
            bitrateGraph[id].updateEndDate();
  
            // calculate number of packets and append to chart
            packetSeries[id].addPoint(now, packets -
              lastResult[id].get(report.id).packetsReceived);
            packetGraph[id].setDataSeries([packetSeries[id]]);
            packetGraph[id].updateEndDate();
          }
        }
      });
      lastResult[id] = res;
    });
  }, 1000);
}