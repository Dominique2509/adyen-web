import { MC_SDK_PROD, MC_SDK_TEST } from '../config';
import { IdentityLookupParams } from '../types';
import AbstractSrcInitiator from './AbstractSrcInitiator';
import SrciError from './SrciError';
import { SrciCompleteIdentityValidationResponse, SrciIdentityLookupResponse } from './types';

const IdentityTypeMap = {
    email: 'EMAIL_ADDRESS',
    mobilePhone: 'MOBILE_PHONE_NUMBER'
};

class MastercardSdk extends AbstractSrcInitiator {
    public readonly schemeName = 'mc';

    constructor(environment: string) {
        super(environment.toLowerCase() === 'test' ? MC_SDK_TEST : MC_SDK_PROD);
    }

    protected isSdkIsAvailableOnWindow(): boolean {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        if (window.SRCSDK_MASTERCARD) return true;
        return false;
    }

    protected assignSdkReference(): void {
        // @ts-ignore SRCSDK_MASTERCARD is created by the MC sdk
        this.schemeSdk = window.SRCSDK_MASTERCARD;
    }

    public async identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse> {
        try {
            const consumerIdentity = {
                identityValue: params.value,
                identityType: IdentityTypeMap[params.type]
            };

            const response = await this.schemeSdk.identityLookup({ consumerIdentity });
            return response;
        } catch (err) {
            throw new SrciError(err);
        }
    }

    public async completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse> {
        try {
            const response = await this.schemeSdk.completeIdentityValidation({ validationData: otp });
            return response;
        } catch (err) {
            throw new SrciError(err);
        }
    }
}

export default MastercardSdk;
