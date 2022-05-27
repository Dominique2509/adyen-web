import { IdentityLookupParams } from '../types';
import Script from '../../../../utils/Script';
import {
    SrcCheckoutParams,
    SrciCheckoutResponse,
    SrciCompleteIdentityValidationResponse,
    SrciIdentityLookupResponse,
    SrciInitiateIdentityValidationResponse,
    SrciIsRecognizedResponse,
    SrcInitParams,
    SrcProfile
} from './types';

export interface ISrcInitiator {
    schemaName: string;
    // Loading 3rd party library
    loadSdkScript(): Promise<void>;
    removeSdkScript(): void;
    // SRCi specification methods
    init(params: SrcInitParams): Promise<void>;
    isRecognized(): Promise<SrciIsRecognizedResponse>;
    identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse>;
    initiateIdentityValidation(): Promise<SrciInitiateIdentityValidationResponse>;
    completeIdentityValidation(validationData: string): Promise<SrciCompleteIdentityValidationResponse>;
    getSrcProfile(idTokens: string[]): Promise<SrcProfile>;
    checkout(params: SrcCheckoutParams): Promise<SrciCheckoutResponse>;
}

export default abstract class AbstractSrcInitiator implements ISrcInitiator {
    public schemaSdk: any;
    public abstract readonly schemaName: string;

    private readonly sdkUrl: string;
    private scriptElement: Script | null = null;

    protected constructor(sdkUrl: string) {
        if (!sdkUrl) throw Error('AbstractSrcInitiator: Invalid SDK URL');
        this.sdkUrl = sdkUrl;
    }

    public async loadSdkScript() {
        if (!this.isSdkIsAvailableOnWindow()) {
            this.scriptElement = new Script(this.sdkUrl);
            await this.scriptElement.load();
        }
        this.assignSdkReference();
    }

    public removeSdkScript(): void {
        this.scriptElement.remove();
    }

    /**
     * Verifies if SDK is already loaded on the window object.
     * Example: Merchant can preload the SDK to speed up the loading time
     */
    protected abstract isSdkIsAvailableOnWindow(): boolean;

    /**
     * Assign Schema SDK object to 'schemaSdk' property.
     * Each schema creates its own object reference on 'window' using different naming,
     * therefore this method should be implemented by the subclass to assign the property
     * accordingly
     */
    protected abstract assignSdkReference(): void;

    /**
     * Initializes the app with common state. The init method must be called before any other methods. It
     * is synchronous in operation.
     */
    public async init(params: SrcInitParams): Promise<void> {
        await this.schemaSdk.init(params);
    }

    /**
     * This method performs checkout using the specified card. If successful, the
     * response contains summary checkout information.
     */
    public async checkout(params: SrcCheckoutParams): Promise<SrciCheckoutResponse> {
        try {
            const response = await this.schemaSdk.checkout(params);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Determines whether the consumer is recognized, e.g. by detecting the presence of a local cookie in
     * the browser environment.
     */
    public async isRecognized(): Promise<SrciIsRecognizedResponse> {
        const response = await this.schemaSdk.isRecognized();
        return response;
    }

    /**
     * Sends a validation code to the specified consumer.
     * This method sends a one-time password (OTP) to the consumer to start validation
     */
    public async initiateIdentityValidation(): Promise<SrciInitiateIdentityValidationResponse> {
        try {
            const response = await this.schemaSdk.initiateIdentityValidation();
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Obtains the masked card and other account profile data associated with the userId.
     */
    public async getSrcProfile(idTokens: string[]): Promise<any> {
        try {
            const response = await this.schemaSdk.getSrcProfile({ idTokens });
            // attach the schema name here maybe?
            return response;
        } catch (error) {
            console.error(`[${this.schemaName}] SecureRemoteCommerceInitiator #getSrcProfile`, error);
            throw error;
        }
    }

    /**
     * Obtains the user account associated with the consumer’s identity (an email address or phone
     * number).
     */
    public abstract identityLookup(params: IdentityLookupParams): Promise<SrciIdentityLookupResponse>;

    /**
     * This method completes the identity validation by receiving the one-time password (OTP) sent to the
     * consumer to start validation.
     */
    public abstract completeIdentityValidation(otp: string): Promise<SrciCompleteIdentityValidationResponse>;
}
