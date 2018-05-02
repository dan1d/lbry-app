// @flow
import React from 'react';
import Page from 'component/page';
import type { Subscription } from 'redux/reducers/subscriptions';
import * as NOTIFICATION_TYPES from 'constants/notification_types';
import Button from 'component/button';
import FileList from 'component/fileList';

type Props = {
  doFetchClaimsByChannel: (string, number) => void,
  doFetchMySubscriptions: () => void,
  setSubscriptionNotifications: ({}) => void,
  // TODO build out claim types
  subscriptions: Array<Subscription>,
  fetchingSubscriptions: boolean,
  subscriptionClaims: Array<{ claims: Array<string> }>,
  notifications: {},
};

export default class extends React.PureComponent<Props> {
  componentDidMount() {
    const { notifications, setSubscriptionNotifications, doFetchMySubscriptions } = this.props;
    doFetchMySubscriptions();

    const newNotifications = {};
    Object.keys(notifications).forEach(cur => {
      if (notifications[cur].type === NOTIFICATION_TYPES.DOWNLOADING) {
        newNotifications[cur] = { ...notifications[cur] };
      }
    });
    setSubscriptionNotifications(newNotifications);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { subscriptions, doFetchClaimsByChannel } = this.props;
    const { subscriptions: nextSubcriptions } = nextProps;

    if (nextSubcriptions.length && nextSubcriptions.length !== subscriptions.length) {
      nextSubcriptions.forEach(sub => doFetchClaimsByChannel(sub.uri, 1));
    }
  }

  render() {
    const { subscriptions, subscriptionClaims, fetchingSubscriptions } = this.props;

    let claimList = [];
    subscriptionClaims.forEach(claimData => {
      claimList = claimList.concat(claimData.claims);
    });

    claimList = claimList.map(claim => ({ uri: `lbry://${claim}` }));

    return (
      <Page notContained loading={fetchingSubscriptions}>
        {!subscriptions.length && (
          <div className="page__empty">
            {__("It looks like you aren't subscribed to any channels yet.")}
            <div className="card__actions card__actions--center">
              <Button button="primary" navigate="/discover" label={__('Explore new content')} />
            </div>
          </div>
        )}
        {!!claimList.length && <FileList hideFilter sortByHeight fileInfos={claimList} />}
      </Page>
    );
  }
}
