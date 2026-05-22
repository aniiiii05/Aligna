import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AlignaColors {
  static const bg = Color(0xFFFDFBF7);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSecondary = Color(0xFFF3F0EA);
  static const primary = Color(0xFF879C93);
  static const primaryHover = Color(0xFF748880);
  static const accent = Color(0xFFD4A373);
  static const text = Color(0xFF2C3531);
  static const textSecondary = Color(0xFF6E7A75);
  static const border = Color(0xFFE6E2D8);
  static const success = Color(0xFF8D9B89);
  static const error = Color(0xFFC67D6F);
}

ThemeData buildAlignaTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AlignaColors.primary,
      surface: AlignaColors.surface,
      background: AlignaColors.bg,
    ),
    scaffoldBackgroundColor: AlignaColors.bg,
  );

  return base.copyWith(
    textTheme: GoogleFonts.outfitTextTheme(base.textTheme).apply(
      bodyColor: AlignaColors.text,
      displayColor: AlignaColors.text,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      foregroundColor: AlignaColors.text,
    ),
    cardTheme: CardTheme(
      color: AlignaColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: AlignaColors.border),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AlignaColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AlignaColors.surface,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AlignaColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AlignaColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: AlignaColors.primary, width: 1.5),
      ),
    ),
  );
}
