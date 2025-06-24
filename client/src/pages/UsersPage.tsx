import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Checkbox,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { getUsers, createUser, deleteUser } from '../utils/api';

const { Title } = Typography;

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('删除失败');
    }
  };

  const handleAddUser = async (values: any) => {
    try {
      await createUser({
        username: values.username,
        password: values.password,
        isAdmin: values.isAdmin || false,
      });
      message.success('添加用户成功');
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      message.error(error.response?.data?.message || '添加用户失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (isAdmin ? '管理员' : '普通用户'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Popconfirm
          title="确定要删除这个用户吗？"
          onConfirm={() => handleDelete(record._id)}
          okText="确定"
          cancelText="取消"
          disabled={record.username === 'admin'}
        >
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            disabled={record.username === 'admin'}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={2}>用户管理</Title>
        <p>管理系统用户账号</p>
      </div>

      <div className="table-operations">
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users.map((user) => ({ ...user, key: user._id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="添加用户"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddUser} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item name="isAdmin" valuePropName="checked">
            <Checkbox>设为管理员</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              添加
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
