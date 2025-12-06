'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiX, FiCheck, FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from './page.module.css';

type SettingsValue = string | number | boolean | SettingsObject | SettingsArray;
type SettingsObject = { [key: string]: SettingsValue };
type SettingsArray = SettingsValue[];

interface FormBuilderProps {
  data: any;
  path: string;
  onChange: (path: string, value: any) => void;
  onDelete?: (path: string) => void;
  level?: number;
}

function FormBuilder({ data, path, onChange, onDelete, level = 0 }: FormBuilderProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Safety check: if data is a string, it shouldn't be rendered by FormBuilder
  if (typeof data === 'string') {
    console.error('FormBuilder received a string instead of an object:', data);
    return <div className={styles.error}>Error: Data is not properly formatted</div>;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const toggleCollapse = (key: string) => {
    const newCollapsed = new Set(collapsed);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsed(newCollapsed);
  };

  const handleChange = (key: string, value: any) => {
    const newPath = path ? `${path}.${key}` : key;
    onChange(newPath, value);
  };

  const handleArrayAdd = (key: string) => {
    const newPath = path ? `${path}.${key}` : key;
    const currentArray = data[key] || [];
    const newItem = typeof currentArray[0] === 'string' ? '' : typeof currentArray[0] === 'number' ? 0 : {};
    onChange(newPath, [...currentArray, newItem]);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const newPath = path ? `${path}.${key}` : key;
    const currentArray = [...data[key]];
    currentArray.splice(index, 1);
    onChange(newPath, currentArray);
  };

  const renderValue = (key: string, value: any) => {
    const fullPath = path ? `${path}.${key}` : key;
    const isCollapsed = collapsed.has(key);

    // Handle objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div key={key} className={styles.nestedSection} style={{ marginLeft: `${level * 20}px` }}>
          <div
            className={styles.nestedHeader}
            onClick={() => toggleCollapse(key)}
          >
            {isCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
            <span className={styles.nestedTitle}>{formatKey(key)}</span>
          </div>
          {!isCollapsed && (
            <div className={styles.nestedContent}>
              <FormBuilder
                data={value}
                path={fullPath}
                onChange={onChange}
                level={level + 1}
              />
            </div>
          )}
        </div>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div key={key} className={styles.nestedSection} style={{ marginLeft: `${level * 20}px` }}>
          <div
            className={styles.nestedHeader}
            onClick={() => toggleCollapse(key)}
          >
            {isCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
            <span className={styles.nestedTitle}>{formatKey(key)} ({value.length} items)</span>
          </div>
          {!isCollapsed && (
            <div className={styles.nestedContent}>
              {value.map((item, index) => (
                <div key={index} className={styles.arrayItem}>
                  {typeof item === 'string' ? (
                    <div className={styles.arrayStringItem}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newArray = [...value];
                          newArray[index] = e.target.value;
                          handleChange(key, newArray);
                        }}
                        className={styles.input}
                        placeholder={`${formatKey(key)} ${index + 1}`}
                      />
                      <button
                        onClick={() => handleArrayRemove(key, index)}
                        className={styles.removeButton}
                        type="button"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ) : typeof item === 'object' ? (
                    <div className={styles.arrayObjectItem}>
                      <div className={styles.arrayObjectHeader}>
                        <span>Item {index + 1}</span>
                        <button
                          onClick={() => handleArrayRemove(key, index)}
                          className={styles.removeButton}
                          type="button"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <FormBuilder
                        data={item}
                        path={`${fullPath}[${index}]`}
                        onChange={onChange}
                        level={level + 1}
                      />
                    </div>
                  ) : (
                    <input
                      type={typeof item === 'number' ? 'number' : 'text'}
                      value={item}
                      onChange={(e) => {
                        const newArray = [...value];
                        newArray[index] = typeof item === 'number' ? Number(e.target.value) : e.target.value;
                        handleChange(key, newArray);
                      }}
                      className={styles.input}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={() => handleArrayAdd(key)}
                className={styles.addButton}
                type="button"
              >
                <FiPlus size={16} />
                Add Item
              </button>
            </div>
          )}
        </div>
      );
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return (
        <div key={key} className={styles.formGroup} style={{ marginLeft: `${level * 20}px` }}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(key, e.target.checked)}
              className={styles.checkbox}
            />
            <span>{formatKey(key)}</span>
          </label>
        </div>
      );
    }

    // Handle strings (with textarea for long text)
    if (typeof value === 'string') {
      const isLongText = value.length > 100;
      return (
        <div key={key} className={styles.formGroup} style={{ marginLeft: `${level * 20}px` }}>
          <label className={styles.label}>{formatKey(key)}</label>
          {isLongText ? (
            <textarea
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder={formatKey(key)}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={styles.input}
              placeholder={formatKey(key)}
            />
          )}
        </div>
      );
    }

    // Handle numbers
    if (typeof value === 'number') {
      return (
        <div key={key} className={styles.formGroup} style={{ marginLeft: `${level * 20}px` }}>
          <label className={styles.label}>{formatKey(key)}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className={styles.input}
            placeholder={formatKey(key)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.formBuilder}>
      {Object.keys(data).map((key) => renderValue(key, data[key]))}
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  const newObj = JSON.parse(JSON.stringify(obj));
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (response.ok && data.settings) {
        console.log('Loaded settings from API:', data.settings);
        console.log('Settings type:', typeof data.settings);

        // Ensure settings is an object, not a string
        const parsedSettings = typeof data.settings === 'string'
          ? JSON.parse(data.settings)
          : data.settings;

        console.log('Parsed settings:', parsedSettings);
        setSettings(parsedSettings);
      } else {
        console.error('Failed to load settings:', data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (path: string, value: any) => {
    const newSettings = setNestedValue(settings, path, value);
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    console.log('Saving settings:', settings);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully! Reload the landing page to see changes.' });
        // Refresh to show what was actually saved
        await fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading settings...</div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className={styles.container}>
        <div className={styles.error}>Failed to load settings</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Landing Page Settings</h1>
        <p className={styles.subtitle}>Edit all landing page content dynamically</p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className={styles.messageClose}>
            <FiX size={16} />
          </button>
        </div>
      )}

      <div className={styles.formContainer}>
        <FormBuilder
          data={settings}
          path=""
          onChange={handleChange}
        />
      </div>

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
          {saving ? (
            <>
              <FiCheck size={18} />
              Saving...
            </>
          ) : (
            <>
              <FiSave size={18} />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </main>
  );
}
