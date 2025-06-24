import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ textAlign: 'center' }}>
      作业收集系统 ©{new Date().getFullYear()} 版权所有
    </AntFooter>
  );
};

export default Footer;
