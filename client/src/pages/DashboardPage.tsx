import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Button } from 'antd';
import {
  UploadOutlined,
  TeamOutlined,
  FileOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUploads } from '../utils/api';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalSchools: 0,
    totalClasses: 0,
    latestUpload: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const uploads = await getUploads();
        
        // 计算统计数据
        const schools = new Set(uploads.map((u: any) => u.school));
        const classes = new Set(uploads.map((u: any) => `${u.school}-${u.college}-${u.major}-${u.class}`));
        
        // 获取最新上传时间
        let latestUpload = '';
        if (uploads.length > 0) {
          const latestDate = new Date(uploads[0].uploadTime);
          latestUpload = latestDate.toLocaleString();
        }
        
        setStats({
          totalUploads: uploads.length,
          totalSchools: schools.size,
          totalClasses: classes.size,
          latestUpload,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={2}>管理面板</Title>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总上传数"
              value={stats.totalUploads}
              loading={loading}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="学校数"
              value={stats.totalSchools}
              loading={loading}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="班级数"
              value={stats.totalClasses}
              loading={loading}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最新上传"
              value={stats.latestUpload || '暂无数据'}
              loading={loading}
              valueStyle={{ fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={6}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            block
            onClick={() => navigate('/uploads')}
          >
            查看上传记录
          </Button>
        </Col>
        <Col span={6}>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            size="large"
            block
            onClick={() => navigate('/uploads')}
          >
            下载作业
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
