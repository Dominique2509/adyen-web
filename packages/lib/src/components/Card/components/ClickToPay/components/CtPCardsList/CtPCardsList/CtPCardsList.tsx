import { h } from 'preact';
import { ShopperCard } from '../../../services/types';
import Field from '../../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../../internal/FormFields';
import { useEffect, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../../utils/useForm';
import './CtPCardsList.scss';

type CtPCardsListProps = {
    cards: ShopperCard[];
    onChangeCard(card: ShopperCard): void;
};

type CardsSelectorDataState = {
    srcDigitalCardId: string;
};

const schema = ['srcDigitalCardId'];

const CtPCardsList = ({ cards, onChangeCard }: CtPCardsListProps) => {
    const { i18n } = useCoreContext();
    const { handleChangeFor, data } = useForm<CardsSelectorDataState>({
        schema,
        defaultData: { srcDigitalCardId: cards[0].srcDigitalCardId }
    });

    const items = useMemo(() => {
        return cards.map(card => ({
            icon: card.artUri,
            name: `${card.cardTitle ? card.cardTitle : ''} •••• ${card.panLastFour}`,
            id: card.srcDigitalCardId
        }));
    }, [cards]);

    useEffect(() => {
        const { srcDigitalCardId } = data;
        const card = cards.find(card => card.srcDigitalCardId === srcDigitalCardId);
        onChangeCard(card);
    }, [data, onChangeCard]);

    return (
        <Field label={i18n.get('Click to Pay cards')} name="clickToPayCards">
            {renderFormField('select', {
                items,
                selected: data['srcDigitalCardId'],
                name: 'cards',
                filterable: false,
                className: 'adyen-checkout-ctp__cards-list-dropdown',
                onChange: handleChangeFor('srcDigitalCardId')
            })}
        </Field>
    );
};

export default CtPCardsList;
