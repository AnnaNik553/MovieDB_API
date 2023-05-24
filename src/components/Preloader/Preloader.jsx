import { Space, Spin } from 'antd'
import './Preloader.css'

const Preloader = () => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Spin tip="Loading...">
        <div className="content" />
      </Spin>
    </Space>
  )
}

export default Preloader
