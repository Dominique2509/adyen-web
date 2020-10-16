import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import callSubmit3DS2Fingerprint from './callSubmit3DS2Fingerprint';

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;

    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = 'threeDS2Fingerprint';

    public static defaultProps = {
        dataKey: 'threeds2.fingerprint',
        type: 'IdentifyShopper'
    };

    private callSubmit3DS2Fingerprint = callSubmit3DS2Fingerprint.bind(this);

    render() {
        console.log('\n### ThreeDS2DeviceFingerprint::render:: this.props=', this.props);
        return <DeviceFingerprint {...this.props} onComplete={this.callSubmit3DS2Fingerprint} />;
    }
}

export default ThreeDS2DeviceFingerprint;
