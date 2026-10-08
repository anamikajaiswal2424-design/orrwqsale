import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { State } from 'country-state-city';
import { FaArrowLeft } from 'react-icons/fa6';
import './Address.css';

export default function Address() {
  const navigate = useNavigate();
  const states = useMemo(() => State.getStatesOfCountry('IN'), []);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: 'AP',
    landmark: '',
    alternate: '',
    type: 'Home',
  });
  const [error, setError] = useState('');

  const change = (event) => {
    const { name, value } = event.target;
    const numeric = ['phone', 'pincode', 'alternate'].includes(name);

    setForm((current) => ({
      ...current,
      [name]: numeric
        ? value.replace(/\D/g, '').slice(0, name === 'pincode' ? 6 : 10)
        : value,
    }));
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();

    if (
      ['name', 'phone', 'pincode', 'locality', 'address', 'city', 'state'].some(
        (key) => !form[key].trim(),
      )
    ) {
      return setError('Please fill all required fields.');
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return setError('Enter a valid 10-digit mobile number.');
    }
    if (!/^[1-9]\d{5}$/.test(form.pincode)) {
      return setError('Enter a valid 6-digit PIN code.');
    }
    if (form.alternate && !/^[6-9]\d{9}$/.test(form.alternate)) {
      return setError('Enter a valid alternate mobile number.');
    }

    const stateName =
      states.find((item) => item.isoCode === form.state)?.name || form.state;

    try {
      localStorage.setItem('fname', form.name.trim());
      localStorage.setItem('mobile', form.phone);
      localStorage.setItem(
        'address',
        [
          form.address,
          form.locality,
          form.landmark,
          form.city,
          stateName,
          form.pincode,
        ]
          .map((value) => value.trim())
          .filter(Boolean)
          .join(', '),
      );
      localStorage.setItem('addressType', form.type);
      localStorage.setItem('alternateMobile', form.alternate);
      navigate('/order-summary');
    } catch {
      setError('Unable to save the address. Please try again.');
    }
  };

  const field = (name, placeholder, options = {}) => (
    <label className="delivery-field" key={name}>
      <span className="delivery-sr-only">{placeholder}</span>
      <input
        name={name}
        value={form[name]}
        onChange={change}
        type={['phone', 'alternate'].includes(name) ? 'tel' : 'text'}
        inputMode={['phone', 'pincode', 'alternate'].includes(name) ? 'numeric' : undefined}
        autoComplete={options.autoComplete}
        placeholder={`${placeholder} (Required)*`}
        aria-label={placeholder}
        required
      />
    </label>
  );

  return (
    <main className="delivery-page">
      <header className="delivery-header">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <FaArrowLeft aria-hidden="true" />
        </button>
        <h1>Add delivery address</h1>
      </header>

      <ol className="delivery-steps" aria-label="Checkout progress">
        {['Address', 'Order Summary', 'Payment'].map((label, index) => (
          <li
            key={label}
            className={index === 0 ? 'is-active' : ''}
            aria-current={index === 0 ? 'step' : undefined}
          >
            <span>{index + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>

      <section className="delivery-panel">
        <form onSubmit={submit} noValidate>
          <div className="delivery-grid">
            {field('name', 'Full Name', { autoComplete: 'name' })}
            {field('phone', 'Mobile number', { autoComplete: 'tel' })}
            {field('pincode', 'Pincode', { autoComplete: 'postal-code' })}

            <div className="delivery-row">
              {field('city', 'City', { autoComplete: 'address-level2' })}

              <label className="delivery-field delivery-state">
                <span>State (Required)*</span>
                <select
                  name="state"
                  value={form.state}
                  onChange={change}
                  autoComplete="address-level1"
                  aria-label="State"
                  required
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {states.map((item) => (
                    <option key={item.isoCode} value={item.isoCode}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {field('address', 'House No., Building Name', {
              autoComplete: 'address-line1',
            })}
            {field('locality', 'Road name, Area, Colony', {
              autoComplete: 'address-line2',
            })}
          </div>

          {error && (
            <p className="delivery-error" role="alert">
              {error}
            </p>
          )}

          <div className="delivery-actions">
            <button type="submit">Continue</button>
          </div>
        </form>
      </section>
    </main>
  );
}
