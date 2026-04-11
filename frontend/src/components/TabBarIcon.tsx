import React from 'react';
import { SvgProps } from 'react-native-svg';

type Props = {
  Icon: React.ComponentType<SvgProps>;
  color: string;
};

const TabBarIcon = ({ Icon, color }: Props) => <Icon width={24} height={24} color={color} />;

export default TabBarIcon;
