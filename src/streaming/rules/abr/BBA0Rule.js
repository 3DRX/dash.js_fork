import SwitchRequest from '../SwitchRequest';
import FactoryMaker from '../../../core/FactoryMaker';
import EventBus from '../../../core/EventBus';
import MediaPlayerEvents from '../../MediaPlayerEvents';
import axios from 'axios';

function BBA0Rule(config) {

    config = config || {};
    const context = this.context;
    const dashMetrics = config.dashMetrics;
    const eventBus = EventBus(context).getInstance();
    // the value of reservoir and cushion should be tuned
    const reservoir = 2;
    const cushion = 8;
    let ratePrev = 0;

    function comp(propertyName) {
        return function(object1, object2) {
            var value1 = object1[propertyName];
            var value2 = object2[propertyName];
            return value1 - value2;
        };
    }

    function fun(currentBufferLevel, step, rateMap) {
        if (currentBufferLevel <= cushion + reservoir && currentBufferLevel >= reservoir) {
            return rateMap[Math.round((currentBufferLevel - reservoir) / step) * step + reservoir];
        }
        else if (currentBufferLevel > cushion + reservoir) {
            return rateMap[cushion + reservoir];
        }
        else {
            return rateMap[reservoir];
        }
    }

    function getMaxIndex(rulesContext) {

        // what's in rulesContext:
        //
        // instance = {
        //     getMediaType,
        //     getMediaInfo,
        //     getDroppedFramesHistory,
        //     getCurrentRequest,
        //     getSwitchHistory,
        //     getStreamInfo,
        //     getScheduleController,
        //     getAbrController,
        //     getRepresentationInfo,
        //     useBufferOccupancyABR,
        //     useL2AABR,
        //     useLoLPABR,
        //     getVideoModel
        // };

        console.log("==========================================");
        const switchRequest = SwitchRequest(context).create();
        const mediaInfo = rulesContext.getMediaInfo();
        const streamInfo = rulesContext.getStreamInfo();
        const streamId = streamInfo ? streamInfo.id : null;
        const mediaType = rulesContext.getMediaInfo().type;
        console.log(`mediaType: ${JSON.stringify(mediaType)}`);
        const abrController = rulesContext.getAbrController();
        const throughputHistory = abrController.getThroughputHistory();
        const latency = throughputHistory.getAverageLatency(mediaType);
        const isDynamic = streamInfo && streamInfo.manifestInfo && streamInfo.manifestInfo.isDynamic;
        const throughput = throughputHistory.getAverageThroughput(mediaType, isDynamic); // In kbits/s

        if (!rulesContext || !rulesContext.hasOwnProperty('getMediaInfo') || !rulesContext.hasOwnProperty('getMediaType') ||
            !rulesContext.hasOwnProperty('getScheduleController') || !rulesContext.hasOwnProperty('getStreamInfo') ||
            !rulesContext.hasOwnProperty('getAbrController')) {
            return switchRequest;
        }

        switchRequest.reason = switchRequest.reason || {};
        console.log(`switchRequest: ${JSON.stringify(switchRequest)}`);

        if (mediaType === 'video') {
            let bitrateList = abrController.getBitrateList(mediaInfo);
            bitrateList.sort(comp('bitrate'));
            console.log(`bitrateList: ${JSON.stringify(bitrateList)}`);
            let rateMap = {};
            let step = cushion / (bitrateList.length - 1);
            for (let i = 0; i < bitrateList.length; i++) {
                rateMap[reservoir + i * step] = bitrateList[i].bitrate;
            }
            let rateMax = bitrateList[bitrateList.length - 1].bitrate;
            let rateMin = bitrateList[0].bitrate;
            ratePrev = ratePrev > rateMin ? ratePrev : rateMin;
            console.log(`ratePrev: ${ratePrev}`);
            console.log(`rateMap: ${JSON.stringify(rateMap)}`);
            let ratePlus = rateMax;
            let rateMinus = rateMin;
            if (ratePrev === rateMax) {
                ratePlus = rateMax;
            }
            else {
                for (let i = 0; i < bitrateList.length; i++) {
                    if (bitrateList[i].bitrate > ratePrev) {
                        ratePlus = bitrateList[i].bitrate;
                        break;
                    }
                }
            }
            if (ratePrev === rateMin) {
                rateMinus = rateMin;
            }
            else {
                for (let i = bitrateList.length - 1; i >= 0; i--) {
                    if (bitrateList[i].bitrate < ratePrev) {
                        rateMinus = bitrateList[i].bitrate;
                        break;
                    }
                }
            }
            console.log(`ratePlus: ${ratePlus}`);
            console.log(`rateMinus: ${rateMinus}`);
            let currentBufferLevel = dashMetrics.getCurrentBufferLevel(mediaType);
            console.log(`currentBufferLevel: ${currentBufferLevel}`);
            let fCurrentBufferLevel = fun(currentBufferLevel, step, rateMap);
            console.log(`fCurrentBufferLevel: ${fCurrentBufferLevel}`);
            let rateNext;
            if (currentBufferLevel <= reservoir) {
                rateNext = rateMin;
            }
            else if (currentBufferLevel >= reservoir + cushion) {
                rateNext = rateMax;
            }
            else if (fCurrentBufferLevel >= ratePlus) {
                for (let i = bitrateList.length - 1; i >= 0; i--) {
                    if (bitrateList[i].bitrate < fCurrentBufferLevel) {
                        rateNext = bitrateList[i].bitrate;
                        break;
                    }
                }
            }
            else if (fCurrentBufferLevel <= rateMinus) {
                for (let i = 0; i < bitrateList.length; i++) {
                    if (bitrateList[i].bitrate > fCurrentBufferLevel) {
                        rateNext = bitrateList[i].bitrate;
                        break;
                    }
                }
            }
            else {
                rateNext = ratePrev;
            }
            ratePrev = rateNext;
            console.log(`rateNext: ${rateNext}`);
            for (let i = 0; i < bitrateList.length; i++) {
                if (bitrateList[i].bitrate === rateNext) {
                    switchRequest.quality = bitrateList[i].qualityIndex;
                    console.log(`quality: ${switchRequest.quality}`);
                    break;
                }
            }

            switchRequest.reason.state = 2;
            switchRequest.reason.throughput = throughput;
            switchRequest.reason.latency = latency;
            switchRequest.reason.bufferLevel = currentBufferLevel;
        } else {
            switchRequest.quality = -1;
            switchRequest.reason = null;
        }
        console.log(`switchRequest: ${JSON.stringify(switchRequest)}`);
        return switchRequest;
    }

    function onBufferEmpty(e) {
        console.log("onBufferEmpty");
        axios.post('http://10.128.185.201:3000/stop?abr=BBA0')
            .then((_response) => {
            })
            .catch((error) => {
                console.log(error);
            });
    }

    function setup() {
        eventBus.on(MediaPlayerEvents.BUFFER_EMPTY, onBufferEmpty, instance);
    }

    function reset() {
        ratePrev = 0;
        eventBus.off(MediaPlayerEvents.BUFFER_EMPTY, onBufferEmpty, instance);
    }

    let instance = {
        getMaxIndex: getMaxIndex,
        reset: reset
    };

    setup();

    return instance;
}

BBA0Rule.__dashjs_factory_name = 'BBA0Rule';
export default FactoryMaker.getClassFactory(BBA0Rule);
