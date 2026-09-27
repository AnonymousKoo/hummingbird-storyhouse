'use client';

import { useState, type FormEvent } from 'react';

export function IntakeForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(public-intake): replace this local-only acknowledgement with an approved
    // delivery adapter. Do not connect the public form directly to Storyhouse Postgres.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="form-success" role="status" tabIndex={-1}>
        <span className="signal-orbit" aria-hidden="true"><i /></span>
        <p className="kicker">Signal received — locally</p>
        <h3>Your story is in motion.</h3>
        <p>
          This preview does not send or store submissions yet. When intake delivery is
          connected, this is where a real confirmation will appear.
        </p>
        <button className="text-button" type="button" onClick={() => { setSubmitted(false); }}>
          Send another idea <span aria-hidden="true">↗</span>
        </button>
      </div>
    );
  }

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="field-pair">
        <label>
          <span>Name</span>
          <input autoComplete="name" name="name" required />
        </label>
        <label>
          <span>Email</span>
          <input autoComplete="email" name="email" required type="email" />
        </label>
      </div>
      <label>
        <span>Company / brand</span>
        <input autoComplete="organization" name="company" required />
      </label>
      <label>
        <span>What are you trying to move?</span>
        <textarea
          name="objective"
          placeholder="A growth goal, business outcome, audience, launch, or conversation…"
          required
          rows={4}
        />
      </label>
      <div className="field-pair">
        <label>
          <span>Interested in</span>
          <select defaultValue="" name="interest" required>
            <option disabled value="">Choose a direction</option>
            <option value="brand-marketing-strategy">Brand &amp; marketing strategy</option>
            <option value="growth-marketing">Growth marketing</option>
            <option value="campaign">Campaign</option>
            <option value="production">Production</option>
            <option value="distribution">Distribution</option>
            <option value="creator-partnership">Creator partnership</option>
            <option value="originals">Originals</option>
          </select>
        </label>
        <label>
          <span>Budget range <em>Optional</em></span>
          <select defaultValue="" name="budget">
            <option value="">Not sure yet</option>
            <option value="under-15">Under $15k</option>
            <option value="15-35">$15k–$35k</option>
            <option value="35-75">$35k–$75k</option>
            <option value="75-plus">$75k+</option>
          </select>
        </label>
      </div>
      <p className="form-note">Preview mode · Nothing is transmitted or stored.</p>
      <button className="button button-primary form-submit" type="submit">
        Bring us the story <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
