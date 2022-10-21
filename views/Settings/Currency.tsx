import * as React from 'react';
import { FlatList, Switch, View, Text } from 'react-native';
import { Header, Icon, ListItem, SearchBar } from 'react-native-elements';
import { inject, observer } from 'mobx-react';

import UnitsStore from './../../stores/UnitsStore';
import SettingsStore, { CURRENCY_KEYS, DEFAULT_FIAT_RATE_URL } from './../../stores/SettingsStore';

import { localeString } from './../../utils/LocaleUtils';
import { themeColor } from './../../utils/ThemeUtils';
import TextInput from '../../components/TextInput';

interface CurrencyProps {
    navigation: any;
    SettingsStore: SettingsStore;
    UnitsStore: UnitsStore;
}

interface CurrencyState {
    selectCurrency: string;
    search: string;
    currencies: any;
}

@inject('SettingsStore', 'UnitsStore')
@observer
export default class Currency extends React.Component<
    CurrencyProps,
    CurrencyState
> {
    state = {
        selectedCurrency: '',
        search: '',
        currencies: CURRENCY_KEYS,
        fiatRateUrl: '',
        useDefaultFiatRateUrl: true
    };

    async UNSAFE_componentWillMount() {
        const { SettingsStore } = this.props;
        const { getSettings } = SettingsStore;
        const settings = await getSettings();
        this.setState({
            selectedCurrency: settings.fiat,
            fiatRateUrl: settings.fiatRateUrl,
            useDefaultFiatRateUrl:
                settings.fiatRateUrl === DEFAULT_FIAT_RATE_URL
        });
    }

    renderSeparator = () => (
        <View
            style={{
                height: 1,
                backgroundColor: themeColor('separator')
            }}
        />
    );

    updateSearch = (value: string) => {
        const result = CURRENCY_KEYS.filter((item: any) =>
            item.key.includes(value)
        );
        this.setState({
            search: value,
            currencies: result
        });
    };

    render() {
        const { navigation, SettingsStore, UnitsStore } = this.props;
        const { selectedCurrency, search, currencies } = this.state;
        const { setSettings, getSettings }: any = SettingsStore;

        const BackButton = () => (
            <Icon
                name="arrow-back"
                onPress={() => navigation.goBack()}
                color={themeColor('text')}
                underlayColor="transparent"
            />
        );

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: themeColor('background')
                }}
            >
                <View style={{ flex: 1 }}>
                    <Header
                        leftComponent={<BackButton />}
                        centerComponent={{
                            text: localeString('views.Settings.Currency.title'),
                            style: {
                                color: themeColor('text'),
                                fontFamily: 'Lato-Regular'
                            }
                        }}
                        backgroundColor={themeColor('background')}
                        containerStyle={{
                            borderBottomWidth: 0
                        }}
                    />
                    <SearchBar
                        placeholder={localeString('general.search')}
                        onChangeText={this.updateSearch}
                        value={search}
                        inputStyle={{
                            color: themeColor('text'),
                            fontFamily: 'Lato-Regular'
                        }}
                        placeholderTextColor={themeColor('secondaryText')}
                        containerStyle={{
                            backgroundColor: themeColor('background'),
                            borderTopWidth: 0,
                            borderBottomWidth: 0
                        }}
                        inputContainerStyle={{
                            borderRadius: 15,
                            backgroundColor: themeColor('secondary')
                        }}
                    />
                    <Text
                        style={{
                            color: themeColor('secondaryText'),
                            fontFamily: 'Lato-Regular'
                        }}
                    >
                        Use Default Fiat Rate URL
                        {/* {localeString(
                            'views.Settings.Privacy.customBlockExplorer'
                        )} */}
                    </Text>
                    <Switch
                        value={this.state.useDefaultFiatRateUrl}
                        onValueChange={async () => {
                            this.setState({
                                useDefaultFiatRateUrl:
                                    !this.state.useDefaultFiatRateUrl
                            });
                        }}
                        trackColor={{
                            false: '#767577',
                            true: themeColor('highlight')
                        }}
                    />
                    {!this.state.useDefaultFiatRateUrl && (
                        <TextInput
                            value={this.state.fiatRateUrl}
                            placeholder="Custom url, i.e. https://btcpay..."
                            onChangeText={async (text: string) => {
                                this.setState({
                                    fiatRateUrl: text
                                });
                                const settings = await getSettings();
                                await setSettings(
                                    JSON.stringify(
                                        settings && {
                                            ...settings,
                                            fiatRateUrl: text
                                        }
                                    )
                                );
                            }}
                        />
                    )}
                    <FlatList
                        data={currencies}
                        renderItem={({ item }) => (
                            <ListItem
                                containerStyle={{
                                    borderBottomWidth: 0,
                                    backgroundColor: themeColor('background')
                                }}
                                onPress={async () => {
                                    const settings = await getSettings();
                                    await setSettings(
                                        JSON.stringify(
                                            settings
                                                ? {
                                                      nodes: settings.nodes,
                                                      theme: settings.theme,
                                                      selectedNode:
                                                          settings.selectedNode,
                                                      fiat: item.value,
                                                      fiatRateUrl:
                                                          settings.fiatRateUrl,
                                                      passphrase:
                                                          settings.passphrase,
                                                      duressPassphrase:
                                                          settings.duressPassphrase,
                                                      pin: settings.pin,
                                                      duressPin:
                                                          settings.duressPin,
                                                      scramblePin:
                                                          settings.scramblePin,
                                                      authenticationAttempts:
                                                          settings.authenticationAttempts,
                                                      locale: settings.locale,
                                                      privacy: settings.privacy
                                                  }
                                                : { fiat: item.value }
                                        )
                                    ).then(() => {
                                        UnitsStore.resetUnits();
                                        getSettings();
                                        navigation.navigate('Settings', {
                                            refresh: true
                                        });
                                    });
                                }}
                            >
                                <ListItem.Content>
                                    <ListItem.Title
                                        style={{
                                            color:
                                                selectedCurrency ===
                                                    item.value ||
                                                (!selectedCurrency &&
                                                    item.value === 'Disabled')
                                                    ? themeColor('highlight')
                                                    : themeColor('text'),
                                            fontFamily: 'Lato-Regular'
                                        }}
                                    >
                                        {item.key}
                                    </ListItem.Title>
                                </ListItem.Content>
                                {(selectedCurrency === item.value ||
                                    (!selectedCurrency &&
                                        item.value === 'Disabled')) && (
                                    <View style={{ textAlign: 'right' }}>
                                        <Icon
                                            name="check"
                                            color={themeColor('highlight')}
                                        />
                                    </View>
                                )}
                            </ListItem>
                        )}
                        keyExtractor={(item, index) => `${item.host}-${index}`}
                        ItemSeparatorComponent={this.renderSeparator}
                    />
                </View>
            </View>
        );
    }
}
