import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { Formik } from 'formik'
import { getById, update } from '../../api/OrderEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'

export default function EditOrderScreen ({ navigation, route }) {
  const [initialProductValues, setInitialProductValues] = useState({ address: null, price: null })
  const [backendErrors, setBackendErrors] = useState()

  useEffect(() => {
    async function fetchOrder () {
      try {
        const fetchedOrder = await getById(route.params.id)
        setInitialProductValues({
          address: fetchedOrder.address,
          price: fetchedOrder.price
        })
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrder()
  }, [route])

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      await update(route.params.id, values)
      showMessage({
        message: 'Order updated successfully',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen', { id: route.params.id })
    } catch (error) {
      setBackendErrors(error.errors)
      showMessage({
        message: `There was an error while updating the order. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    price: yup
      .number()
      .positive('Please provide a positive price value')
      .required('Price is required')
  })

  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialProductValues}
      onSubmit={updateOrder}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='address'
                label='Address:'
              />
              <InputItem
                name='price'
                label='Price:'
              />
              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }
              <Pressable
                onPress={ handleSubmit }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  }
})
