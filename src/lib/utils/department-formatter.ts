/**
 * Utility functions for formatting and validating French department codes
 */

/**
 * Valid French department codes (including overseas territories)
 */
const VALID_DEPARTMENTS = new Set([
  '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95',
  '2A', '2B',
  '971', '972', '973', '974', '975', '976', '977', '978',
  '984', '986', '987', '988', '989'
]);

/**
 * Normalizes a department code to standard format
 * @param code - Raw department code
 * @returns Normalized code or null if invalid
 */
function normalizeDepartmentCode(code: string | number): string | null {
  if (!code) return null;

  let normalized = String(code).trim().toUpperCase();

  if (normalized.length === 1) {
    normalized = '0' + normalized;
  }

  if (VALID_DEPARTMENTS.has(normalized)) {
    return normalized;
  }

  if (normalized.length > 3) {
    const isOnlyZeroPadding = /^(\d{2,3})0+$/.test(normalized);

    if (isOnlyZeroPadding) {
      const twoDigit = normalized.substring(0, 2);
      if (VALID_DEPARTMENTS.has(twoDigit)) {
        return twoDigit;
      }

      const threeDigit = normalized.substring(0, 3);
      if (VALID_DEPARTMENTS.has(threeDigit)) {
        return threeDigit;
      }
    }
  }

  return null;
}

/**
 * Formats department codes from BOAMP API data
 * Handles arrays, single values, and filters invalid codes
 * @param departmentData - Raw department data from API
 * @returns Formatted department string or 'N/A'
 */
export function formatDepartments(departmentData: string | number | (string | number)[] | null | undefined): string {
  if (!departmentData) {
    return 'N/A';
  }

  const codes: (string | number)[] = Array.isArray(departmentData) ? departmentData : [departmentData];

  const validCodes = codes
    .map(code => normalizeDepartmentCode(code))
    .filter((code): code is string => code !== null)
    .filter((code, index, array) => array.indexOf(code) === index);

  if (validCodes.length === 0) {
    return 'N/A';
  }

  validCodes.sort((a, b) => {
    const numA = parseInt(a.replace(/[AB]/g, ''));
    const numB = parseInt(b.replace(/[AB]/g, ''));
    return numA - numB;
  });

  return validCodes.join(', ');
}

/**
 * Checks if a department code is valid
 * @param code - Department code to check
 * @returns true if valid
 */
export function isValidDepartment(code: string | number): boolean {
  return normalizeDepartmentCode(code) !== null;
}
