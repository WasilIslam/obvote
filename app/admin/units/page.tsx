'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiKey, FiPlus, FiTrash2, FiCheck, FiX, FiChevronDown, FiChevronRight, FiDownload } from 'react-icons/fi';
import styles from './page.module.css';

interface Unit {
  id: string;
  identifier: string;
  metadata: any;
  createdAt: string;
}

interface RegistrationCode {
  code: string;
  unitId: string | null;
  usedBy: string | null;
  used: boolean;
  createdAt: string;
  usedAt: string | null;
  unitIdentifier?: string;
}

export default function UnitsAdminPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'units' | 'codes'>('units');
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Unit form state
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitIdentifier, setUnitIdentifier] = useState('');
  const [unitRegistrationCode, setUnitRegistrationCode] = useState('');
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  // Code form state
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [unitsRes, codesRes] = await Promise.all([
        fetch('/api/admin/units'),
        fetch('/api/admin/registration-codes')
      ]);

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.units || []);
      }

      if (codesRes.ok) {
        const codesData = await codesRes.json();
        setCodes(codesData.codes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnitSubmitting(true);
    setMessage(null);

    // Check if unit already exists
    const existingUnit = units.find(u => u.identifier.toLowerCase() === unitIdentifier.toLowerCase().trim());
    if (existingUnit) {
      setMessage({ type: 'error', text: `Unit "${unitIdentifier}" already exists. Please use a different unit number.` });
      setUnitSubmitting(false);
      return;
    }

    try {
      // Create unit first
      const unitResponse = await fetch('/api/admin/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: unitIdentifier })
      });

      const unitData = await unitResponse.json();

      if (!unitResponse.ok) {
        setMessage({ type: 'error', text: unitData.error || 'Failed to create unit' });
        setUnitSubmitting(false);
        return;
      }

      // If registration code is provided, create it and link to unit
      if (unitRegistrationCode.trim()) {
        const codeResponse = await fetch('/api/admin/registration-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: unitRegistrationCode.trim(),
            unitId: unitData.unit.id
          })
        });

        if (!codeResponse.ok) {
          const codeData = await codeResponse.json();
          setMessage({
            type: 'error',
            text: `Unit created but failed to create registration code: ${codeData.error}`
          });
        } else {
          setMessage({ type: 'success', text: 'Unit and registration code created successfully!' });
        }
      } else {
        setMessage({ type: 'success', text: 'Unit created successfully!' });
      }

      setUnitIdentifier('');
      setUnitRegistrationCode('');
      setShowUnitForm(false);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setUnitSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/units?id=${unitId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Unit deleted successfully' });
        fetchData();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete unit' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/registration-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeValue,
          unitId: selectedUnitId || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration code created successfully' });
        setCodeValue('');
        setSelectedUnitId('');
        setShowCodeForm(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setCodeSubmitting(false);
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!confirm('Are you sure you want to delete this registration code?')) return;

    try {
      const response = await fetch(`/api/admin/registration-codes?code=${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration code deleted successfully' });
        fetchData();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCodeForForm = () => {
    setUnitRegistrationCode(generateRandomCode());
  };

  const handleGenerateCodeForCodeForm = () => {
    setCodeValue(generateRandomCode());
  };

  const getCodesForUnit = (unitId: string) => {
    return codes.filter(code => code.unitId === unitId);
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnitId(expandedUnitId === unitId ? null : unitId);
  };

  const handleQuickAddCode = async (unitId: string) => {
    const newCode = generateRandomCode();

    try {
      const response = await fetch('/api/admin/registration-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode, unitId })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration code created successfully' });
        fetchData();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to create code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    }
  };

  const exportToExcel = () => {
    // Create CSV data
    const headers = ['Unit ID', 'Registration Code', 'Status', 'Used By', 'Created Date', 'Used Date'];
    const allRows: string[][] = [];

    units.forEach(unit => {
      const unitCodes = getCodesForUnit(unit.id);
      if (unitCodes.length === 0) {
        allRows.push([unit.identifier, 'No codes', '-', '-', new Date(unit.createdAt).toLocaleDateString(), '-']);
      } else {
        unitCodes.forEach(code => {
          allRows.push([
            unit.identifier,
            code.code,
            code.used ? 'Used' : 'Unused',
            code.usedBy || '-',
            new Date(code.createdAt).toLocaleDateString(),
            code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '-'
          ]);
        });
      }
    });

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...allRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `obvote-units-codes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage({ type: 'success', text: 'Excel file downloaded successfully!' });
  };

  const getUnitStats = (unitId: string) => {
    const unitCodes = getCodesForUnit(unitId);
    const usedCount = unitCodes.filter(c => c.used).length;
    const totalCount = unitCodes.length;
    return { used: usedCount, total: totalCount };
  };

  return (
    <main className={styles.mainContainer}>
      {/* Message */}
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
          <span className={styles.messageText}>{message.text}</span>
          <button onClick={() => setMessage(null)} className={styles.messageClose}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Units & Registration Codes</h1>
        <p className={styles.pageSubtitle}>Manage apartment units and their registration codes</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsList}>
          <button
            onClick={() => setActiveTab('units')}
            className={`${styles.tab} ${activeTab === 'units' ? styles.tabActive : ''}`}
          >
            <FiHome size={18} />
            Units ({units.length})
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`${styles.tab} ${activeTab === 'codes' ? styles.tabActive : ''}`}
          >
            <FiKey size={18} />
            All Codes ({codes.length})
          </button>
        </div>
        <button onClick={exportToExcel} className={styles.exportBtn}>
          <FiDownload size={16} />
          Export to Excel
        </button>
      </div>

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Apartment Units</h2>
            <button onClick={() => setShowUnitForm(!showUnitForm)} className={styles.addBtn}>
              <FiPlus size={18} />
              Add Unit
            </button>
          </div>

          {showUnitForm && (
            <div className={styles.formCard}>
              <form onSubmit={handleCreateUnit}>
                <h3 className={styles.formTitle}>Create New Unit</h3>
                <div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Unit Number / Identifier <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 4B, 12A, Apt 205"
                      value={unitIdentifier}
                      onChange={(e) => setUnitIdentifier(e.target.value)}
                      required
                      className={styles.formInput}
                    />
                    <p className={styles.formHint}>
                      This must be unique. You cannot create duplicate unit numbers.
                    </p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Registration Code <span style={{ fontSize: '12px' }}>(Optional)</span>
                    </label>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="Leave empty or enter custom code"
                        value={unitRegistrationCode}
                        onChange={(e) => setUnitRegistrationCode(e.target.value)}
                        className={`${styles.formInput} ${styles.inputGroupInput}`}
                      />
                      <button type="button" onClick={handleGenerateCodeForForm} className={styles.generateBtn}>
                        Generate
                      </button>
                    </div>
                    <p className={styles.formHint}>
                      You can add registration codes later if needed.
                    </p>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" disabled={unitSubmitting} className={styles.submitBtn}>
                    {unitSubmitting ? 'Creating...' : 'Create Unit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnitForm(false);
                      setUnitIdentifier('');
                      setUnitRegistrationCode('');
                    }}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading units...</p>
            </div>
          ) : units.length === 0 ? (
            <div className={styles.emptyState}>
              <FiHome size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No units found. Create your first unit to get started.</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={`${styles.tableHeadCell} ${styles.tableHeadCellNarrow}`}></th>
                    <th className={styles.tableHeadCell}>Unit ID</th>
                    <th className={styles.tableHeadCell}>Registration Codes</th>
                    <th className={styles.tableHeadCell}>Created</th>
                    <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {units.map((unit) => {
                    const unitCodes = getCodesForUnit(unit.id);
                    const stats = getUnitStats(unit.id);
                    const isExpanded = expandedUnitId === unit.id;

                    return (
                      <>
                        <tr key={unit.id} className={styles.tableRow}>
                          <td className={styles.tableCell}>
                            <button onClick={() => toggleUnitExpansion(unit.id)} className={styles.expandBtn}>
                              {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                            </button>
                          </td>
                          <td
                            className={`${styles.tableCell} ${styles.tableCellMedium}`}
                            onClick={() => toggleUnitExpansion(unit.id)}
                          >
                            {unit.identifier}
                          </td>
                          <td className={styles.tableCell} onClick={() => toggleUnitExpansion(unit.id)}>
                            <span className={`${styles.badge} ${stats.total > 0 ? styles.badgeSuccess : styles.badgeNeutral}`}>
                              <FiKey size={12} />
                              {stats.used}/{stats.total} used
                            </span>
                          </td>
                          <td
                            className={`${styles.tableCell} ${styles.tableCellSecondary}`}
                            onClick={() => toggleUnitExpansion(unit.id)}
                          >
                            {new Date(unit.createdAt).toLocaleDateString()}
                          </td>
                          <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUnit(unit.id);
                              }}
                              className={styles.deleteBtn}
                            >
                              <FiTrash2 size={14} />
                              Delete
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${unit.id}-expanded`} className={styles.expandedRow}>
                            <td colSpan={5}>
                              <div className={styles.expandedContent}>
                                <div className={styles.expandedHeader}>
                                  <h4 className={styles.expandedTitle}>
                                    Registration Codes for Unit {unit.identifier}
                                  </h4>
                                  <button onClick={() => handleQuickAddCode(unit.id)} className={styles.quickAddBtn}>
                                    <FiPlus size={14} />
                                    Add Code
                                  </button>
                                </div>

                                {unitCodes.length === 0 ? (
                                  <div className={styles.nestedEmptyState}>
                                    <FiKey size={32} className={styles.nestedEmptyIcon} />
                                    <p className={styles.nestedEmptyText}>
                                      No registration codes for this unit yet.
                                    </p>
                                  </div>
                                ) : (
                                  <div className={styles.nestedTableCard}>
                                    <table className={styles.table}>
                                      <thead className={styles.nestedTableHead}>
                                        <tr>
                                          <th className={styles.nestedTableHeadCell}>Code</th>
                                          <th className={styles.nestedTableHeadCell}>Status</th>
                                          <th className={styles.nestedTableHeadCell}>Created</th>
                                          <th className={`${styles.nestedTableHeadCell} ${styles.nestedTableHeadCellRight}`}>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className={styles.tableBody}>
                                        {unitCodes.map((code) => (
                                          <tr key={code.code} className={styles.nestedTableRow}>
                                            <td className={`${styles.nestedTableCell} ${styles.nestedTableCellMono}`}>
                                              {code.code}
                                            </td>
                                            <td className={styles.nestedTableCell}>
                                              {code.used ? (
                                                <span className={`${styles.smallBadge} ${styles.smallBadgeSuccess}`}>
                                                  <FiCheck size={12} />
                                                  Used
                                                </span>
                                              ) : (
                                                <span className={`${styles.smallBadge} ${styles.smallBadgeWarning}`}>
                                                  Unused
                                                </span>
                                              )}
                                            </td>
                                            <td className={`${styles.nestedTableCell} ${styles.tableCellSecondary}`}>
                                              {new Date(code.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className={`${styles.nestedTableCell} ${styles.tableCellRight}`}>
                                              <button
                                                onClick={() => handleDeleteCode(code.code)}
                                                disabled={code.used}
                                                className={styles.smallDeleteBtn}
                                              >
                                                <FiTrash2 size={12} />
                                                Delete
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Registration Codes Tab */}
      {activeTab === 'codes' && (
        <div>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Registration Codes</h2>
            <button onClick={() => setShowCodeForm(!showCodeForm)} className={styles.addBtn}>
              <FiPlus size={18} />
              Add Code
            </button>
          </div>

          {showCodeForm && (
            <div className={styles.formCard}>
              <form onSubmit={handleCreateCode}>
                <h3 className={styles.formTitle}>Create Registration Code</h3>
                <div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Registration Code <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputGroup}>
                      <input
                        type="text"
                        placeholder="e.g., ABCD-1234-EFGH"
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        required
                        className={`${styles.formInput} ${styles.inputGroupInput}`}
                      />
                      <button type="button" onClick={handleGenerateCodeForCodeForm} className={styles.generateBtn}>
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Assign to Unit <span style={{ fontSize: '12px' }}>(Optional)</span>
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="">No unit (unassigned)</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          Unit {unit.identifier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" disabled={codeSubmitting} className={styles.submitBtn}>
                    {codeSubmitting ? 'Creating...' : 'Create Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeForm(false);
                      setCodeValue('');
                      setSelectedUnitId('');
                    }}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading codes...</p>
            </div>
          ) : codes.length === 0 ? (
            <div className={styles.emptyState}>
              <FiKey size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No registration codes found. Create your first code to get started.</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Code</th>
                    <th className={styles.tableHeadCell}>Unit</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Created</th>
                    <th className={`${styles.tableHeadCell} ${styles.tableHeadCellRight}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {codes.map((code) => (
                    <tr key={code.code} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellMono} ${styles.tableCellMedium}`}>{code.code}</td>
                      <td className={styles.tableCell}>
                        {code.unitIdentifier ? (
                          <span className={styles.unitBadge}>
                            <FiHome size={12} />
                            {code.unitIdentifier}
                          </span>
                        ) : (
                          <span className={styles.emptyDash}>—</span>
                        )}
                      </td>
                      <td className={styles.tableCell}>
                        {code.used ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <FiCheck size={12} />
                            Used
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeWarning}`}>
                            Unused
                          </span>
                        )}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellSecondary}`}>
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                        <button
                          onClick={() => handleDeleteCode(code.code)}
                          disabled={code.used}
                          className={styles.deleteBtn}
                        >
                          <FiTrash2 size={14} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
