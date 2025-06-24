import React from 'react';
import { Typography, Button, Space } from 'antd';
import { UploadOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Title level={1}>一站式作业收集系统</Title>
      <Paragraph style={{ fontSize: '18px', margin: '20px 0 40px' }}>
        帮助教师或助教高效收集作业，统一接收每个班级上传的压缩包，满足"产教融合"、"项目实践课程"执行需要
      </Paragraph>

      <Space size="large">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          size="large"
          onClick={() => navigate('/upload')}
        >
          上传作业
        </Button>
        {isAuthenticated && (
          <Button
            type="default"
            icon={<DashboardOutlined />}
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            管理面板
          </Button>
        )}
      </Space>

      <div style={{ marginTop: '60px' }}>
        <Title level={3}>系统功能</Title>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
          <div style={{ width: '300px', textAlign: 'left' }}>
            <Title level={4}>前端上传页面</Title>
            <ul>
              <li>表单填写（学校、学院、专业、班级等信息）</li>
              <li>文件上传（支持 .zip .rar .7z 类型）</li>
              <li>上传状态提示（成功/失败）</li>
              <li>唯一限制（同一班级只能上传一次）</li>
            </ul>
          </div>
          <div style={{ width: '300px', textAlign: 'left' }}>
            <Title level={4}>管理员后台系统</Title>
            <ul>
              <li>上传列表查看（按时间/学校/专业/班级浏览）</li>
              <li>作业包下载（批量或按条件筛选）</li>
              <li>搜索与筛选（按多种条件快速定位）</li>
              <li>数据导出（一键导出 Excel）</li>
              <li>删除/替换上传记录</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
