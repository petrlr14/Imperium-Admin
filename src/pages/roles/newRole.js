import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Button, Form, Input, notification, Spin, Transfer } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { createRole, privileges } from 'services/api/api';
import { FormInput } from 'components/formInput';
import { useHistory } from 'react-router-dom';

const { Item } = Form;

function trateData(data) {
  console.log(data);
  return data
    ? data.data.map((item) => ({
        key: item.id,
        title: item.displayName,
        description: `Permiso para ${item.displayName}`,
      }))
    : [];
}

export function NewRole() {
  const history = useHistory();
  const [targetKeys, setTargetKeys] = useState([]);
  const { data } = useQuery('new-privileges', privileges);

  const onFinish = async (value) => {
    console.log(value, targetKeys);
    try {
      await createRole({ name: value.name, privileges: targetKeys });
      notification.success({ message: 'El rol se ha creado correctamente' });
      history.push('/users/roles/');
    } catch (e) {
      notification.error({ message: 'Ocurrio algo fliplante' });
    }
  };

  const onChange = (newTargetKeys, direction, moveKeys) => {
    setTargetKeys(newTargetKeys);
  };

  return (
    <>
      {data ? (
        <div className='relative min-h-full w-full flex flex-col justify-center items-center self-stretch'>
          <Form
            onFinish={onFinish}
            className='flex justify-around items-center pb-5 gap-5'>
            <FormInput label='Nombre del rol' id='name'>
              <Item
                name='name'
                rules={[
                  {
                    required: true,
                    message: 'Debes ingresar el nombre del nuevo rol',
                  },
                ]}>
                <Input type='text' id='name' className='shadow' />
              </Item>
            </FormInput>
            <Item className='mb-0'>
              <Button className='secundary-btn' htmlType='submit'>
                Guardar
              </Button>
            </Item>
          </Form>

          <Transfer
            className='flex flex-col sm:flex-row'
            showSearch
            dataSource={data ? trateData(data) : []}
            targetKeys={targetKeys}
            onChange={onChange}
            oneWay={true}
            titles={['Sin seleccionar', 'Seleccionados']}
            render={(item) => item.title}
            filterOption={(value, option) => {
              return option.title.toLowerCase().indexOf(value) > -1;
            }}
            listStyle={{
              width: 300,
              height: 300,
            }}
          />
        </div>
      ) : (
        <div className='absolute min-h-full w-full flex flex-col justify-center items-center'>
          <Spin indicator={() => <LoadingOutlined spin />} />
        </div>
      )}
    </>
  );
}
