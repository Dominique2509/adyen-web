import { Fragment, h } from 'preact';
import useClickToPayContext from './components/ClickToPay/context/useClickToPayContext';
import { CtpState } from './components/ClickToPay/services/ClickToPayService';
import { useCallback, useEffect, useState } from 'preact/hooks';
import ClickToPayComponent from './components/ClickToPay';
import ContentSeparator from '../internal/ContentSeparator';
import Button from '../internal/Button';
import useCoreContext from '../../core/Context/useCoreContext';

type ClickToPayWrapperProps = {
    onSubmit(payload: any): void;
    children(isCardPrimaryInput?: boolean): h.JSX.Element;
};

const ClickToPayWrapper = ({ onSubmit, children }: ClickToPayWrapperProps) => {
    const { i18n } = useCoreContext();
    const [isCardInputVisible, setIsCardInputVisible] = useState<boolean>(null);
    const { ctpState, isCtpPrimaryPaymentMethod, setIsCtpPrimaryPaymentMethod } = useClickToPayContext();

    const areFieldsNotSet = isCardInputVisible === null && isCtpPrimaryPaymentMethod === null;

    useEffect(() => {
        if (areFieldsNotSet) {
            if (ctpState === CtpState.ShopperIdentified || ctpState === CtpState.Ready) {
                setIsCardInputVisible(false);
                setIsCtpPrimaryPaymentMethod(true);
                return;
            }
            if (ctpState === CtpState.NotAvailable) {
                setIsCardInputVisible(true);
                setIsCtpPrimaryPaymentMethod(false);
            }
        }
    }, [ctpState, areFieldsNotSet]);

    const handleOnShowCardButtonClick = useCallback(() => {
        setIsCardInputVisible(true);
        setIsCtpPrimaryPaymentMethod(false);
    }, []);

    if (ctpState === CtpState.NotAvailable) {
        return children();
    }

    if (ctpState === CtpState.Loading || ctpState === CtpState.ShopperIdentified) {
        return <ClickToPayComponent />;
    }

    return (
        <Fragment>
            <ClickToPayComponent onSubmit={onSubmit} />
            <ContentSeparator classNames={['adyen-checkout-ctp__separator']} label={i18n.get('qrCodeOrApp')} />

            {isCardInputVisible ? (
                children(!isCtpPrimaryPaymentMethod)
            ) : (
                <Button
                    variant="secondary"
                    label={ctpState === CtpState.Ready ? i18n.get('ctp.useAnotherCard') : i18n.get('ctp.manualCardEntry')}
                    onClick={handleOnShowCardButtonClick}
                />
            )}
        </Fragment>
    );
};

export default ClickToPayWrapper;
