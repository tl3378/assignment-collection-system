import React, { useEffect, useState } from 'react';
import { Typography, Button, Spin, Row, Col, Divider, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;

interface UploadData {
  _id: string;
  school: string;
  college: string;
  major: string;
  class: string;
  contact: string;
  remark: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  uploadTime: string;
}

const ReceiptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.upload) {
      setUploadData(location.state.upload);
    } else {
      // If no data was passed, redirect to upload page
      message.error('没有上传数据，请重新上传');
      navigate('/upload');
    }
  }, [location, navigate]);

  const saveReceipt = async () => {
    const receiptElement = document.getElementById('receipt-container');
    if (!receiptElement) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f2f5',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `提交回执-${uploadData?.school}-${uploadData?.class}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      message.success('提交回执保存成功');
    } catch (error) {
      console.error('保存回执失败:', error);
      message.error('保存回执失败');
    } finally {
      setLoading(false);
    }
  };

  if (!uploadData) {
    return <Spin size="large" />;
  }

  const uploadDate = new Date(uploadData.uploadTime);
  const formattedDate = uploadDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        id="receipt-container"
        style={{
          background: '#f0f2f5',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              {'>>>>>>>>>>'}
            </div>
            <Title level={2} style={{ margin: 0, flex: 1, color: '#1d3557' }}>
              提交证明
            </Title>
            <div style={{ flex: 1, textAlign: 'right' }}>
              {'<<<<<<<<<<'}
            </div>
          </div>
        </div>

        <Divider style={{ borderColor: '#aaa', margin: '20px 0' }} />

        <Row gutter={[0, 24]}>
          <Col span={6}>
            <Text strong style={{ fontSize: '16px' }}>学校名称</Text>
          </Col>
          <Col span={18}>
            <Text style={{ fontSize: '16px' }}>{uploadData.school}</Text>
          </Col>
          
          <Col span={6}>
            <Text strong style={{ fontSize: '16px' }}>所在学院</Text>
          </Col>
          <Col span={18}>
            <Text style={{ fontSize: '16px' }}>{uploadData.college}</Text>
          </Col>
          
          <Col span={6}>
            <Text strong style={{ fontSize: '16px' }}>专业</Text>
          </Col>
          <Col span={18}>
            <Text style={{ fontSize: '16px' }}>{uploadData.major}</Text>
          </Col>
          
          <Col span={6}>
            <Text strong style={{ fontSize: '16px' }}>班级</Text>
          </Col>
          <Col span={18}>
            <Text style={{ fontSize: '16px' }}>{uploadData.class}</Text>
          </Col>
          
          {uploadData.contact && (
            <>
              <Col span={6}>
                <Text strong style={{ fontSize: '16px' }}>联系人</Text>
              </Col>
              <Col span={18}>
                <Text style={{ fontSize: '16px' }}>{uploadData.contact}</Text>
              </Col>
            </>
          )}
          
          {uploadData.remark && (
            <>
              <Col span={6}>
                <Text strong style={{ fontSize: '16px' }}>备注</Text>
              </Col>
              <Col span={18}>
                <Text style={{ fontSize: '16px' }}>{uploadData.remark}</Text>
              </Col>
            </>
          )}
          
          <Col span={6}>
            <Text strong style={{ fontSize: '16px' }}>提交时间</Text>
          </Col>
          <Col span={18}>
            <Text style={{ fontSize: '16px' }}>{formattedDate}</Text>
          </Col>
        </Row>

        {/* 已提交印章 */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            right: '60px',
            transform: 'translateY(-50%) rotate(-15deg)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '2px solid #4a7bcc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#4a7bcc',
            fontSize: '24px',
            fontWeight: 'bold',
            boxShadow: 'inset 0 0 10px rgba(74, 123, 204, 0.4)',
            opacity: 0.85
          }}
        >
          已提交
        </div>

        <Divider style={{ borderColor: '#aaa', margin: '30px 0' }} />

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={saveReceipt}
            loading={loading}
            style={{ width: '200px', height: '50px', fontSize: '16px' }}
          >
            保存提交证明
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage; 