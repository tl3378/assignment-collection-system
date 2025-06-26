import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { getUploads, deleteUpload, downloadFile, exportExcel } from '../utils/api';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Upload {
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

interface FilterValues {
  school?: string;
  college?: string;
  major?: string;
  class?: string;
  dateRange?: [string, string];
  startDate?: string;
  endDate?: string;
}

const UploadsListPage: React.FC = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});
  const [form] = Form.useForm();

  const fetchUploads = async (filterValues?: FilterValues) => {
    try {
      setLoading(true);
      const data = await getUploads(filterValues);
      setUploads(data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      message.error('获取上传记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleSearch = (values: FilterValues) => {
    const filterValues: FilterValues = {};
    
    if (values.school) filterValues.school = values.school;
    if (values.college) filterValues.college = values.college;
    if (values.major) filterValues.major = values.major;
    if (values.class) filterValues.class = values.class;
    
    if (values.dateRange && values.dateRange.length === 2) {
      filterValues.startDate = values.dateRange[0];
      filterValues.endDate = values.dateRange[1];
    }
    
    setFilters(filterValues);
    fetchUploads(filterValues);
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({});
    fetchUploads();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUpload(id);
      message.success('删除成功');
      fetchUploads(filters);
    } catch (error) {
      console.error('Error deleting upload:', error);
      message.error('删除失败');
    }
  };

  const handleDownload = (id: string) => {
    downloadFile(id);
  };

  const handleExport = () => {
    exportExcel(filters);
  };

  const columns = [
    {
      title: '学校',
      dataIndex: 'school',
      key: 'school',
      width: 150,
    },
    {
      title: '学院',
      dataIndex: 'college',
      key: 'college',
      width: 150,
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
      width: 150,
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
      width: 120,
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100,
    },
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size: number) => `${(size / (1024 * 1024)).toFixed(2)} MB`,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Upload) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record._id)}
          >
            下载
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>上传记录</Title>
        <p>管理所有班级提交的作业</p>
      </div>

      <div className="filter-form">
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="school" label="学校">
                <Input placeholder="输入学校名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="college" label="学院">
                <Input placeholder="输入学院名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="major" label="专业">
                <Input placeholder="输入专业名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="class" label="班级">
                <Input placeholder="输入班级名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateRange" label="上传时间范围">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    搜索
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={handleExport}
                  >
                    导出Excel
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>

      <Table
        columns={columns}
        dataSource={uploads.map((upload) => ({ ...upload, key: upload._id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
      />
    </div>
  );
};

export default UploadsListPage;
