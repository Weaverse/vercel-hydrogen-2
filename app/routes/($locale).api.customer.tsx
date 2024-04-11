import { ActionFunction, ActionFunctionArgs, json } from "@remix-run/server-runtime"
import { CustomerCreateMutation } from "storefrontapi.generated"
import { CUSTOMER_CREATE_MUTATION } from "~/data/mutations"

export let action: ActionFunction = async ({request, context}: ActionFunctionArgs) => {
  let formData = await request.formData()
  let email = formData.get('email')
  let {storefront} = context

  let {
    customerCreate,
    errors: queryError
  } = await storefront.mutate<CustomerCreateMutation>(CUSTOMER_CREATE_MUTATION, {
    variables: {
      input: {
        email,
        password: "123456",
        acceptsMarketing: true
      }
    }
  })
  let customer = customerCreate?.customer
  let errors = customerCreate?.customerUserErrors || queryError
  if (errors && errors.length) {
    return json({errors}, {
      status: 200
    })
  }
  return json({customer}, {
    status: 201
  })
}