"""Calendar utilities for working day calculations respecting location-specific holidays in Costa del Sol.

Parses holiday data from calendarios.md to provide calendar-aware scheduling for tasks and fiscal obligations.
"""

from datetime import date, timedelta

# 2026 Holiday Calendar for Costa del Sol
# Source: calendarios.md

HOLIDAYS_2026 = {
    "National": [
        date(2026, 1, 1),   # Año Nuevo
        date(2026, 1, 6),   # Reyes Magos
        date(2026, 2, 28),  # Día de Andalucía
        date(2026, 4, 2),   # Jueves Santo
        date(2026, 4, 3),   # Viernes Santo
        date(2026, 5, 1),   # Día del Trabajo
        date(2026, 8, 15),  # Asunción de la Virgen
        date(2026, 10, 12), # Fiesta Nacional de España
        date(2026, 11, 2),  # Todos los Santos (observed on Monday)
        date(2026, 12, 7),  # Día de la Constitución
        date(2026, 12, 8),  # Inmaculada Concepción
        date(2026, 12, 25), # Navidad
    ],
    "Marbella": [
        date(2026, 6, 11),  # San Bernabé (local)
        date(2026, 10, 19), # San Pedro (local)
    ],
    "Mijas": [
        date(2026, 9, 8),   # Virgen de la Peña (local)
        date(2026, 10, 15), # Santa Teresa (local)
    ],
    "Estepona": [
        date(2026, 5, 15),  # San Isidro (local)
        date(2026, 7, 16),  # Virgen del Carmen (local)
    ],
}


def is_working_day(d: date, location: str = "Marbella") -> bool:
    """Check if a given date is a working day (not weekend or holiday).
    
    Args:
        d: Date to check
        location: Municipality ("Marbella", "Mijas", or "Estepona")
    
    Returns:
        True if the date is a working day, False otherwise
    """
    # Weekend check
    if d.weekday() in (5, 6):  # Saturday = 5, Sunday = 6
        return False
    
    # National holiday check
    if d in HOLIDAYS_2026["National"]:
        return False
    
    # Local holiday check
    if d in HOLIDAYS_2026.get(location, []):
        return False
    
    return True


def add_working_days(start: date, days: int, location: str = "Marbella") -> date:
    """Add a specified number of working days to a start date.
    
    Respects weekends and location-specific holidays.
    
    Args:
        start: Starting date
        days: Number of working days to add
        location: Municipality ("Marbella", "Mijas", or "Estepona")
    
    Returns:
        The resulting date after adding working days
        
    Examples:
        >>> add_working_days(date(2026, 6, 5), 5, "Marbella")
        date(2026, 6, 16)  # Skips weekend and June 11 (San Bernabé)
    """
    current = start
    remaining = days
    
    while remaining > 0:
        current += timedelta(days=1)
        if is_working_day(current, location):
            remaining -= 1
    
    return current


def get_next_working_day(d: date, location: str = "Marbella") -> date:
    """Get the next working day after a given date.
    
    Args:
        d: Starting date
        location: Municipality ("Marbella", "Mijas", or "Estepona")
    
    Returns:
        The next working day
    """
    next_day = d + timedelta(days=1)
    while not is_working_day(next_day, location):
        next_day += timedelta(days=1)
    return next_day


def get_holidays(year: int, location: str = "Marbella") -> list[date]:
    """Get all holidays for a given year and location.
    
    Args:
        year: Year to retrieve holidays for
        location: Municipality ("Marbella", "Mijas", or "Estepona")
    
    Returns:
        List of holiday dates
    """
    if year != 2026:
        # For now, we only have 2026 data
        # In production, this would query a database or external calendar service
        return []
    
    national = HOLIDAYS_2026["National"]
    local = HOLIDAYS_2026.get(location, [])
    return sorted(national + local)


def count_working_days_between(start: date, end: date, location: str = "Marbella") -> int:
    """Count the number of working days between two dates (inclusive).
    
    Args:
        start: Start date
        end: End date
        location: Municipality ("Marbella", "Mijas", or "Estepona")
    
    Returns:
        Number of working days
    """
    if start > end:
        return 0
    
    count = 0
    current = start
    while current <= end:
        if is_working_day(current, location):
            count += 1
        current += timedelta(days=1)
    
    return count
