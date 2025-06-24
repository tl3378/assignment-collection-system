import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Typography,
  Result,
} from 'antd';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { uploadAssignment, checkClassUploaded } from '../utils/api';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface UploadFormData {
  school: string;
  college: string;
  major: string;
  class: string;
  contact?: string;
  remark?: string;
  file: any;
}

const UploadPage: React.FC = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const handleSubmit = async (values: UploadFormData) => {
    try {
      if (!fileList.length) {
        message.error('请选择要上传的文件');
        return;
      }

      // 检查班级是否已上传
      try {
        const checkResult = await checkClassUploaded(
          values.school,
          values.college,
          values.major,
          values.class
        );

        if (checkResult.exists) {
          const confirmOverwrite = window.confirm(
            '该班级已上传过作业，是否覆盖？'
          );
          if (!confirmOverwrite) {
            return;
          }
        }
      } catch (checkError) {
        // 继续上传，不阻止流程
      }

      setUploading(true);

      // 创建表单数据
      const formData = new FormData();
      formData.append('school', values.school);
      formData.append('college', values.college);
      formData.append('major', values.major);
      formData.append('class', values.class);
      if (values.contact) formData.append('contact', values.contact);
      if (values.remark) formData.append('remark', values.remark);
      formData.append('file', fileList[0].originFileObj);

      // 直接使用 axios 发送请求
      try {
        const response = await axios.post('http://localhost:5001/api/uploads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadResult({
          success: true,
          message: '作业上传成功！',
        });

        // 清空表单
        form.resetFields();
        setFileList([]);
      } catch (uploadError: any) {
        setUploadResult({
          success: false,
          message: '上传失败，请重试',
          details: uploadError.response?.data?.message || uploadError.message,
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      setUploadResult({
        success: false,
        message: '上传失败，请重试',
        details: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file: any) => {
    const isValidType =
      file.type === 'application/zip' ||
      file.type === 'application/x-rar-compressed' ||
      file.type === 'application/x-7z-compressed' ||
      /\.(zip|rar|7z)$/.test(file.name.toLowerCase());

    if (!isValidType) {
      message.error('只能上传 .zip, .rar, .7z 格式的文件!');
    }

    const isLessThan200MB = file.size / 1024 / 1024 < 200;
    
    if (!isLessThan200MB) {
      message.error('文件大小不能超过 200MB!');
    }

    return isValidType && isLessThan200MB;
  };

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];
    // 只保留最后一个文件
    newFileList = newFileList.slice(-1);
    setFileList(newFileList);
  };

  const resetForm = () => {
    form.resetFields();
    setFileList([]);
    setUploadResult(null);
  };

  return (
    <div className="upload-form">
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        作业上传
      </Title>

      {uploadResult ? (
        <div className="upload-result">
          <Result
            status={uploadResult.success ? 'success' : 'error'}
            icon={
              uploadResult.success ? (
                <CheckCircleOutlined className="success-icon" />
              ) : (
                <CloseCircleOutlined className="error-icon" />
              )
            }
            title={uploadResult.message}
            subTitle={uploadResult.details}
            extra={
              <Button type="primary" onClick={resetForm}>
                继续上传
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{
              school: '北京体育大学',
              college: '新闻与传播学院',
              major: '新闻学',
              class: '研究生一班'
            }}
          >
            <Form.Item
              name="school"
              label="学校名称"
              rules={[{ required: true, message: '请输入学校名称' }]}
            >
              <Input placeholder="请输入学校名称" />
            </Form.Item>

            <Form.Item
              name="college"
              label="学院"
              rules={[{ required: true, message: '请输入学院名称' }]}
            >
              <Input placeholder="请输入学院名称" />
            </Form.Item>

            <Form.Item
              name="major"
              label="专业"
              rules={[{ required: true, message: '请输入专业名称' }]}
            >
              <Input placeholder="请输入专业名称" />
            </Form.Item>

            <Form.Item
              name="class"
              label="班级"
              rules={[{ required: true, message: '请输入班级名称' }]}
            >
              <Input placeholder="请输入班级名称" />
            </Form.Item>

            <Form.Item name="contact" label="联系人">
              <Input placeholder="请输入联系人姓名（可选）" />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea
                placeholder="请输入备注信息（可选）"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="file"
              label="上传文件"
              rules={[{ required: true, message: '请上传作业文件' }]}
            >
              <Upload
                beforeUpload={beforeUpload}
                onChange={handleChange}
                fileList={fileList}
                maxCount={1}
                customRequest={({ onSuccess }: any) => {
                  if (onSuccess) onSuccess('ok');
                }}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
                <div style={{ marginTop: '8px', color: '#888' }}>
                  支持 .zip, .rar, .7z 格式，最大 200MB
                </div>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                style={{ width: '100%' }}
              >
                {uploading ? '上传中...' : '提交作业'}
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default UploadPage;
