import { openLink } from '@telegram-apps/sdk-react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import {
  Avatar,
  Cell,
  List,
  Navigation,
  Placeholder,
  Section,
  Text,
  Title,
} from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';
import { WalletBalance } from '@/components/TON/WalletBalance';
import { bem } from '@/css/bem.ts';
import { logger } from '@/lib/logger';

import './TONConnectPage.css';

const [, e] = bem('ton-connect-page');

export const TONConnectPage: FC = () => {
  const wallet = useTonWallet();
  const [balanceRefreshCount, setBalanceRefreshCount] = useState(0);

  // Функция для инициирования обновления баланса (при необходимости)
  const triggerBalanceRefresh = () => {
    setBalanceRefreshCount(prev => prev + 1);
    logger.info('Запрошено обновление баланса');
  };

  if (!wallet) {
    return (
      <Page>
        <Placeholder
          className={e('placeholder')}
          header="TON Connect"
          description={
            <>
              <Text>
                To display the data related to the TON Connect, it is required to connect your
                wallet
              </Text>
              <TonConnectButton className={e('button')}/>
            </>
          }
        />
      </Page>
    );
  }

  const {
    account: { chain, publicKey, address },
    device: {
      appName,
      appVersion,
      maxProtocolVersion,
      platform,
      features,
    },
  } = wallet;

  return (
    <Page>
      <List>
        {'imageUrl' in wallet && (
          <>
            <Section>
              <Cell
                before={
                  <Avatar src={wallet.imageUrl} alt="Provider logo" width={60} height={60}/>
                }
                after={<Navigation>About wallet</Navigation>}
                subtitle={wallet.appName}
                onClick={(e) => {
                  e.preventDefault();
                  openLink(wallet.aboutUrl);
                }}
              >
                <Title level="3">{wallet.name}</Title>
              </Cell>
            </Section>
            
            {/* Отображение баланса кошелька */}
            <WalletBalance 
              style="section" 
              title="TON Balance" 
              autoRefreshInterval={60000} // 1 минута
              showRefreshButton={true} 
            />
            
            <Section>
              <TonConnectButton className={e('button-connected')}/>
            </Section>
          </>
        )}
        <DisplayData
          header="Account"
          rows={[
            { title: 'Address', value: address },
            { title: 'Chain', value: chain },
            { title: 'Public Key', value: publicKey },
          ]}
        />
        <DisplayData
          header="Device"
          rows={[
            { title: 'App Name', value: appName },
            { title: 'App Version', value: appVersion },
            { title: 'Max Protocol Version', value: maxProtocolVersion },
            { title: 'Platform', value: platform },
            {
              title: 'Features',
              value: features
                .map(f => typeof f === 'object' ? f.name : undefined)
                .filter(v => v)
                .join(', '),
            },
          ]}
        />
      </List>
    </Page>
  );
};
