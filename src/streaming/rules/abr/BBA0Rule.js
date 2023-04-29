import MetricsConstants from '../../constants/MetricsConstants';
import SwitchRequest from '../SwitchRequest';
import FactoryMaker from '../../../core/FactoryMaker';
import { HTTPRequest } from '../../vo/metrics/HTTPRequest';
import EventBus from '../../../core/EventBus';
import Events from '../../../core/events/Events';
import Debug from '../../../core/Debug';
import MediaPlayerEvents from '../../MediaPlayerEvents';
import Constants from '../../constants/Constants';

function BBA0Rule(config) {

    config = config || {};
    const context = this.context;

    const dashMetrics = config.dashMetrics;
    const mediaPlayerModel = config.mediaPlayerModel;
    const eventBus = EventBus(context).getInstance();

    let instance,
        logger;

    const reservoir = 8;
    const cushion = 30;
    let ratePrev = 0;

    function setup() {
        logger = Debug(context).getInstance().getLogger(instance);
        // eventBus.on(MediaPlayerEvents.BUFFER_EMPTY, onBufferEmpty, instance);
        // eventBus.on(MediaPlayerEvents.PLAYBACK_SEEKING, onPlaybackSeeking, instance);
        // eventBus.on(MediaPlayerEvents.METRIC_ADDED, onMetricAdded, instance);
        // eventBus.on(MediaPlayerEvents.QUALITY_CHANGE_REQUESTED, onQualityChangeRequested, instance);
        // eventBus.on(MediaPlayerEvents.FRAGMENT_LOADING_ABANDONED, onFragmentLoadingAbandoned, instance);
        // eventBus.on(Events.MEDIA_FRAGMENT_LOADED, onMediaFragmentLoaded, instance);
    }

    function getMaxIndex(rulesContext) {
    }

    function reset() {
        // eventBus.off(MediaPlayerEvents.BUFFER_EMPTY, onBufferEmpty, instance);
        // eventBus.off(MediaPlayerEvents.PLAYBACK_SEEKING, onPlaybackSeeking, instance);
        // eventBus.off(MediaPlayerEvents.METRIC_ADDED, onMetricAdded, instance);
        // eventBus.off(MediaPlayerEvents.QUALITY_CHANGE_REQUESTED, onQualityChangeRequested, instance);
        // eventBus.off(MediaPlayerEvents.FRAGMENT_LOADING_ABANDONED, onFragmentLoadingAbandoned, instance);
        // eventBus.off(Events.MEDIA_FRAGMENT_LOADED, onMediaFragmentLoaded, instance);
    }

    instance = {
        getMaxIndex: getMaxIndex,
        reset: reset
    };

    setup();
    return instance;
}

BBA0Rule.__dashjs_factory_name = 'BBA0Rule';
export default FactoryMaker.getClassFactory(BBA0Rule);
