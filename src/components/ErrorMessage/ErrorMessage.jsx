import { Alert, Space } from 'antd'

import './ErrorMessage.css'

const ErrorMessage = () => {
  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Alert message="Error" description="something has gone terribly wrong" type="error" closable />
    </Space>
  )
}

export default ErrorMessage
