"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface SubscriptionFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const CheckoutForm: React.FC<SubscriptionFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Ошибка при оплате");
      setLoading(false);
    } else {
      onSuccess();
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-700 hover:bg-gray-600 text-orange-300 px-4 py-2 rounded transition"
          disabled={loading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded transition"
        >
          {loading ? "Оплата..." : "Оплатить"}
        </button>
      </div>
    </form>
  );
};

const SubscriptionFormWrapper: React.FC<SubscriptionFormProps> = (props) => {
  const options = {
    clientSecret: props.clientSecret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default SubscriptionFormWrapper;
